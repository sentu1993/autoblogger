from app.worker.celery_app import celery_app
from app.services.rss import parse_feed
from app.services.extractor import extract_content
from app.services.ai import AIService
from app.services.cms import CMSService
from app.services.seo_validator import SEOValidator
from app.services.content_formatter import ContentFormatter
from app.core.security import decrypt_data
from app.db.session import Session
from app.db.models import Project, Source, Post, PostStatus, Schedule
from sqlmodel import select
import json
import asyncio
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

@celery_app.task(name="process_schedule_task")
def process_schedule_task(schedule_id: int):
    """
    Executed by Celery Beat or manually.
    Fetches RSS feeds for the project and creates pending posts.
    """
    with Session() as session:
        schedule = session.get(Schedule, schedule_id)
        if not schedule or not schedule.is_active:
            return f"Schedule {schedule_id} not found or inactive"
        
        project = session.get(Project, schedule.project_id)
        if not project:
            return f"Project {schedule.project_id} not found"
        
        posts_created = 0
        for source in project.sources:
            if not source.is_active:
                continue
                
            if source.type == "rss":
                entries = parse_feed(source.url)
                # Limit to posts_per_run
                for entry in entries[:schedule.posts_per_run]:
                    # Check if post already exists
                    statement = select(Post).where(Post.source_url == entry['link'])
                    existing_post = session.exec(statement).first()
                    
                    if not existing_post:
                        new_post = Post(
                            project_id=project.id,
                            source_url=entry['link'],
                            status=PostStatus.PENDING
                        )
                        session.add(new_post)
                        session.commit()
                        session.refresh(new_post)
                        
                        # Trigger processing task
                        process_article_task.delay(new_post.id)
                        posts_created += 1
                        
        # Update last_run_time and next_run_time
        schedule.last_run_time = datetime.utcnow()
        # Simple interval calculation for now
        if schedule.schedule_type == "interval":
            delta = timedelta(hours=schedule.interval_value) if schedule.interval_unit == "hours" else timedelta(days=schedule.interval_value)
            schedule.next_run_time = schedule.last_run_time + delta
        
        session.add(schedule)
        session.commit()
        
    return f"Finished schedule {schedule_id}, created {posts_created} posts"

@celery_app.task(name="process_article_task")
def process_article_task(post_id: int):
    """
    Generates content, validates SEO, formats HTML and prepares for publishing.
    """
    with Session() as session:
        post = session.get(Post, post_id)
        if not post:
            return f"Post {post_id} not found"
        
        project = session.get(Project, post.project_id)
        settings = project.generation_settings
        
        if not settings:
            post.status = PostStatus.FAILED
            post.error_log = "No generation settings found for project"
            session.add(post)
            session.commit()
            return f"Settings missing for project {project.id}"
        
        try:
            # 1. Extract content from source
            content = extract_content(post.source_url)
            
            # 2. AI Transformation
            ai_service = AIService(
                provider=settings.ai_provider,
                api_key=decrypt_data(settings.encrypted_ai_api_key)
            )
            
            prompt = ai_service.get_seo_prompt(
                facts=content['text'],
                keywords=settings.primary_keywords,
                tone=settings.tone
            )
            
            loop = asyncio.get_event_loop()
            ai_response_json = loop.run_until_complete(ai_service.generate_content(prompt))
            
            # Remove possible markdown code blocks from AI response
            if ai_response_json.startswith("```json"):
                ai_response_json = ai_response_json.replace("```json", "").replace("```", "").strip()
            
            ai_data = json.loads(ai_response_json)
            
            # 3. SEO Validation
            seo_report = SEOValidator.validate(
                content_html=ai_data['content_html'],
                seo_title=ai_data['seo_title'],
                meta_description=ai_data['meta_description'],
                keywords=settings.primary_keywords
            )
            
            # 4. Formatting & Polishing
            formatted_html = ContentFormatter.format(
                html_content=ai_data['content_html'],
                schema_json=json.dumps(ai_data.get('schema_json')) if ai_data.get('schema_json') else None,
                cta_template=project.cta_template
            )
            
            # 5. Update Post
            post.generated_title = ai_data['seo_title']
            post.content_html = formatted_html
            post.meta_description = ai_data['meta_description']
            post.slug = ai_data['slug']
            post.suggested_tags = ai_data.get('suggested_tags', [])
            post.seo_score = seo_report['score']
            post.content_schema = json.dumps(ai_data.get('schema_json'))
            post.status = PostStatus.GENERATED
            
            session.add(post)
            session.commit()
            
            # 6. Trigger Publish if automatic (or just trigger it for now)
            publish_post_task.delay(post.id)
            
        except Exception as e:
            logger.exception(f"Error processing post {post_id}")
            post.status = PostStatus.FAILED
            post.error_log = str(e)
            session.add(post)
            session.commit()
            return f"Error processing post {post_id}: {str(e)}"
            
    return f"Finished processing article for post {post_id}"

@celery_app.task(name="publish_post_task")
def publish_post_task(post_id: int):
    """
    Pushes the generated and formatted content to the CMS.
    """
    with Session() as session:
        post = session.get(Post, post_id)
        if not post or post.status != PostStatus.GENERATED:
            return f"Post {post_id} not ready for publishing"
        
        try:
            post_data = {
                "seo_title": post.generated_title,
                "content_html": post.content_html,
                "meta_description": post.meta_description,
                "slug": post.slug,
                "suggested_tags": post.suggested_tags,
                "schema_json": post.content_schema
            }
            
            published_url = CMSService.publish(
                project_id=post.project_id,
                post_data=post_data,
                session=session
            )
            
            post.published_url = published_url
            post.published_at = datetime.utcnow()
            post.status = PostStatus.PUBLISHED
            session.add(post)
            session.commit()
            
        except Exception as e:
            logger.exception(f"Error publishing post {post_id}")
            post.status = PostStatus.FAILED
            post.error_log = f"Publishing Error: {str(e)}"
            session.add(post)
            session.commit()
            return f"Error publishing post {post_id}: {str(e)}"
            
    return f"Successfully published post {post_id}"
