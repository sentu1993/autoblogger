from app.worker.celery_app import celery_app
from app.services.rss import parse_feed
from app.services.extractor import extract_content
from app.services.ai import AIService
from app.db.session import Session
from app.db.models import Project, Source, Post, PostStatus
from sqlmodel import select
import json
import asyncio

@celery_app.task(name="fetch_rss_task")
def fetch_rss_task(project_id: int):
    with Session() as session:
        project = session.get(Project, project_id)
        if not project:
            return f"Project {project_id} not found"
        
        for source in project.sources:
            if source.is_active and source.type == "rss":
                entries = parse_feed(source.url)
                for entry in entries:
                    # Check if post already exists
                    statement = select(Post).where(Post.source_url == entry['link'])
                    existing_post = session.exec(statement).first()
                    
                    if not existing_post:
                        new_post = Post(
                            project_id=project_id,
                            source_url=entry['link'],
                            status=PostStatus.PENDING
                        )
                        session.add(new_post)
                        session.commit()
                        session.refresh(new_post)
                        
                        # Trigger processing task
                        process_article_task.delay(new_post.id)
    return f"Finished fetching RSS for project {project_id}"

@celery_app.task(name="process_article_task")
def process_article_task(post_id: int):
    with Session() as session:
        post = session.get(Post, post_id)
        if not post:
            return f"Post {post_id} not found"
        
        project = session.get(Project, post.project_id)
        settings = project.generation_settings
        
        try:
            # Step 1: Extract content
            content = extract_content(post.source_url)
            
            # Step 2: AI Transformation
            ai_service = AIService(
                provider=settings.ai_provider,
                api_key=settings.encrypted_ai_api_key # TODO: Decrypt
            )
            
            prompt = ai_service.get_seo_prompt(
                facts=content['text'],
                keywords=settings.primary_keywords,
                tone=settings.tone
            )
            
            # Run async AI call in sync Celery task
            loop = asyncio.get_event_loop()
            ai_response_json = loop.run_until_complete(ai_service.generate_content(prompt))
            ai_data = json.loads(ai_response_json)
            
            post.generated_title = ai_data['seo_title']
            post.status = PostStatus.GENERATED
            # TODO: Store full AI data in DB or a separate table
            session.add(post)
            session.commit()
            
            # Step 3: Trigger Publish
            # publish_task.delay(post.id)
            
        except Exception as e:
            post.status = PostStatus.FAILED
            post.error_log = str(e)
            session.add(post)
            session.commit()
            return f"Error processing post {post_id}: {str(e)}"
            
    return f"Finished processing article for post {post_id}"
