import requests
from typing import Dict, Any
import json
from sqlmodel import Session

    @staticmethod
    def publish(project_id: int, post_data: Dict[str, Any], session: Session) -> str:
        from app.db.models import Project, CMSType
        project = session.get(Project, project_id)
        if not project:
            raise ValueError("Project not found")

        creds = project.cms_credentials
        
        if project.cms_type == CMSType.WORDPRESS:
            return CMSService.publish_to_wordpress(
                url=creds.get("url"),
                username=creds.get("username"),
                app_password=creds.get("password"),
                post_data=post_data
            )
        elif project.cms_type == CMSType.WEBFLOW:
            return CMSService.publish_to_webflow(
                api_token=creds.get("token"),
                collection_id=creds.get("collection_id"),
                post_data=post_data
            )
        elif project.cms_type == CMSType.CUSTOM:
            return CMSService.publish_to_webhook(
                webhook_url=creds.get("webhook_url"),
                post_data=post_data
            )
        else:
            raise ValueError(f"Unsupported CMS type: {project.cms_type}")
    @staticmethod
    def publish_to_wordpress(url: str, username: str, app_password: str, post_data: Dict[str, Any]) -> str:
        """
        Publishes to WordPress using REST API.
        """
        api_url = f"{url.rstrip('/')}/wp-json/wp/v2/posts"
        auth = (username, app_password)
        
        payload = {
            "title": post_data.get("seo_title"),
            "content": post_data.get("content_html"),
            "status": "publish",
            "excerpt": post_data.get("meta_description"),
            "slug": post_data.get("slug")
        }
        
        response = requests.post(api_url, auth=auth, json=payload)
        response.raise_for_status()
        return response.json().get("link")

    @staticmethod
    def publish_to_webhook(webhook_url: str, post_data: Dict[str, Any]) -> str:
        """
        Sends post data to a custom webhook.
        """
        response = requests.post(webhook_url, json=post_data)
        response.raise_for_status()
        return "Webhook sent successfully"

    @staticmethod
    def publish_to_webflow(api_token: str, collection_id: str, post_data: Dict[str, Any]) -> str:
        """
        Publishes to Webflow CMS.
        """
        api_url = f"https://api.webflow.com/collections/{collection_id}/items"
        headers = {
            "Authorization": f"Bearer {api_token}",
            "accept-version": "1.0.0",
            "Content-Type": "application/json"
        }
        
        # Webflow requires specific field mapping which depends on the collection schema
        payload = {
            "fields": {
                "name": post_data.get("seo_title"),
                "slug": post_data.get("slug"),
                "post-body": post_data.get("content_html"),
                "post-summary": post_data.get("meta_description"),
                "_archived": False,
                "_draft": False
            }
        }
        
        response = requests.post(api_url, headers=headers, json=payload)
        response.raise_for_status()
        return f"https://webflow.com/item/{response.json().get('_id')}"
