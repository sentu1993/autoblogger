import requests
import hashlib
import hmac
import json
import logging
from typing import Dict, Any, Optional
from sqlmodel import Session

logger = logging.getLogger(__name__)


class CMSService:
    """
    Unified CMS publishing service.
    Routes content to the correct platform publisher based on project CMS type.
    Supports: WordPress (REST API + Basic Auth), Webflow (CMS API v2 + Bearer),
    Custom Webhooks (configurable auth: None/API Key/Bearer/HMAC).
    """

    @staticmethod
    def publish(project_id: int, post_data: Dict[str, Any], session: Session) -> str:
        """
        Main entry point. Dispatches to the correct platform publisher.

        post_data expected shape:
        {
            "seo_title": str,
            "content_html": str,
            "meta_description": str,
            "slug": str,
            "schema_json": str (optional),
            "suggested_tags": list[str] (optional),
            "featured_image_url": str (optional)
        }
        """
        from app.db.models import Project, CMSType

        project = session.get(Project, project_id)
        if not project:
            raise ValueError(f"Project {project_id} not found")

        creds = project.cms_credentials
        cms_type = project.cms_type

        logger.info(f"Publishing to {cms_type} for project '{project.name}' (ID: {project_id})")

        if cms_type == CMSType.WORDPRESS:
            return CMSService._publish_wordpress(
                url=creds.get("url", ""),
                username=creds.get("username", ""),
                app_password=creds.get("app_password", ""),
                post_data=post_data
            )
        elif cms_type == CMSType.WEBFLOW:
            return CMSService._publish_webflow(
                api_token=creds.get("api_token", ""),
                site_id=creds.get("site_id", ""),
                collection_id=creds.get("collection_id", ""),
                post_data=post_data
            )
        elif cms_type == CMSType.CUSTOM:
            return CMSService._publish_webhook(
                endpoint_url=creds.get("endpoint_url", ""),
                auth_method=creds.get("auth_method", "none"),
                auth_header_name=creds.get("auth_header_name", "X-API-Key"),
                auth_secret=creds.get("auth_secret", ""),
                post_data=post_data
            )
        else:
            raise ValueError(f"Unsupported CMS type: {cms_type}")

    # ──────────────────────────────────────────────────────
    # WordPress REST API — Basic Auth with Application Passwords
    # ──────────────────────────────────────────────────────

    @staticmethod
    def _publish_wordpress(
        url: str,
        username: str,
        app_password: str,
        post_data: Dict[str, Any]
    ) -> str:
        """
        WordPress REST API v2 publisher.
        Auth: HTTP Basic Auth (username + Application Password).
        Endpoint: POST {url}/wp-json/wp/v2/posts
        """
        api_url = f"{url.rstrip('/')}/wp-json/wp/v2/posts"
        auth = (username, app_password)

        # Build the full HTML content with schema injection
        content = post_data.get("content_html", "")
        schema = post_data.get("schema_json", "")
        if schema:
            content += f'\n<script type="application/ld+json">{schema}</script>'

        payload = {
            "title": post_data.get("seo_title", ""),
            "content": content,
            "status": "publish",
            "excerpt": post_data.get("meta_description", ""),
            "slug": post_data.get("slug", ""),
        }

        # Map suggested tags if available
        tags = post_data.get("suggested_tags", [])
        if tags:
            payload["tags"] = CMSService._resolve_wp_tags(url, auth, tags)

        logger.info(f"WordPress POST → {api_url}")
        response = requests.post(api_url, auth=auth, json=payload, timeout=30)
        response.raise_for_status()

        published_url = response.json().get("link", "")
        logger.info(f"WordPress published: {published_url}")
        return published_url

    @staticmethod
    def _resolve_wp_tags(url: str, auth: tuple, tag_names: list) -> list:
        """
        Resolve tag names to WordPress tag IDs.
        Creates tags that don't exist yet.
        """
        tag_ids = []
        tags_url = f"{url.rstrip('/')}/wp-json/wp/v2/tags"

        for name in tag_names[:10]:  # Limit to 10 tags
            try:
                # Search for existing tag
                search_resp = requests.get(
                    tags_url, auth=auth,
                    params={"search": name}, timeout=10
                )
                search_resp.raise_for_status()
                existing = search_resp.json()

                if existing:
                    tag_ids.append(existing[0]["id"])
                else:
                    # Create new tag
                    create_resp = requests.post(
                        tags_url, auth=auth,
                        json={"name": name}, timeout=10
                    )
                    create_resp.raise_for_status()
                    tag_ids.append(create_resp.json()["id"])
            except Exception as e:
                logger.warning(f"Failed to resolve WP tag '{name}': {e}")
                continue

        return tag_ids

    # ──────────────────────────────────────────────────────
    # Webflow CMS API v2 — Bearer Token Authentication
    # ──────────────────────────────────────────────────────

    @staticmethod
    def _publish_webflow(
        api_token: str,
        site_id: str,
        collection_id: str,
        post_data: Dict[str, Any]
    ) -> str:
        """
        Webflow CMS API v2 publisher.
        Auth: Bearer Token in Authorization header.
        Endpoint: POST https://api.webflow.com/v2/collections/{collection_id}/items
        Then publish: POST https://api.webflow.com/v2/collections/{collection_id}/items/{item_id}/publish
        """
        api_url = f"https://api.webflow.com/v2/collections/{collection_id}/items"
        headers = {
            "Authorization": f"Bearer {api_token}",
            "Content-Type": "application/json"
        }

        # Build content with schema
        content = post_data.get("content_html", "")
        schema = post_data.get("schema_json", "")
        if schema:
            content += f'\n<script type="application/ld+json">{schema}</script>'

        # Webflow v2 uses fieldData (not fields)
        payload = {
            "fieldData": {
                "name": post_data.get("seo_title", ""),
                "slug": post_data.get("slug", ""),
                "post-body": content,
                "post-summary": post_data.get("meta_description", ""),
            },
            "isArchived": False,
            "isDraft": False
        }

        logger.info(f"Webflow POST → {api_url}")
        response = requests.post(api_url, headers=headers, json=payload, timeout=30)
        response.raise_for_status()

        item_data = response.json()
        item_id = item_data.get("id", "")

        # Publish the item live on the site
        if site_id and item_id:
            publish_url = f"https://api.webflow.com/v2/sites/{site_id}/publish"
            publish_payload = {
                "publishToWebflowSubdomain": True,
                "collectionIds": [collection_id]
            }
            try:
                pub_resp = requests.post(
                    publish_url, headers=headers,
                    json=publish_payload, timeout=30
                )
                pub_resp.raise_for_status()
                logger.info(f"Webflow site published for collection {collection_id}")
            except Exception as e:
                logger.warning(f"Webflow publish step failed (item created but not live): {e}")

        return f"https://webflow.com/item/{item_id}"

    # ──────────────────────────────────────────────────────
    # Custom Webhook — Configurable Authentication
    # ──────────────────────────────────────────────────────

    @staticmethod
    def _publish_webhook(
        endpoint_url: str,
        auth_method: str,
        auth_header_name: str,
        auth_secret: str,
        post_data: Dict[str, Any]
    ) -> str:
        """
        Custom webhook publisher with configurable authentication.
        
        Auth methods:
        - none:    No auth headers, plain POST
        - api_key: Sends {auth_header_name}: {auth_secret}
        - bearer:  Sends Authorization: Bearer {auth_secret}
        - hmac:    Computes HMAC-SHA256 of body, sends in X-Signature header
        """
        headers = {"Content-Type": "application/json"}
        body_bytes = json.dumps(post_data, separators=(",", ":")).encode("utf-8")

        if auth_method == "api_key":
            headers[auth_header_name] = auth_secret
        elif auth_method == "bearer":
            headers["Authorization"] = f"Bearer {auth_secret}"
        elif auth_method == "hmac":
            signature = hmac.new(
                auth_secret.encode("utf-8"),
                body_bytes,
                hashlib.sha256
            ).hexdigest()
            headers["X-Signature"] = f"sha256={signature}"
            headers[auth_header_name] = f"sha256={signature}"

        logger.info(f"Webhook POST → {endpoint_url} (auth: {auth_method})")
        response = requests.post(
            endpoint_url,
            headers=headers,
            data=body_bytes,
            timeout=30
        )
        response.raise_for_status()
        return f"Webhook delivered successfully (HTTP {response.status_code})"

    # ──────────────────────────────────────────────────────
    # Connection Testing
    # ──────────────────────────────────────────────────────

    @staticmethod
    def test_connection(cms_type: str, credentials: Dict[str, Any]) -> Dict[str, Any]:
        """
        Tests CMS connectivity without publishing.
        Returns {"success": bool, "message": str}
        """
        try:
            if cms_type == "wordpress":
                url = credentials.get("url", "").rstrip("/")
                api_url = f"{url}/wp-json/wp/v2/posts?per_page=1"
                auth = (credentials.get("username", ""), credentials.get("app_password", ""))
                resp = requests.get(api_url, auth=auth, timeout=10)
                resp.raise_for_status()
                return {"success": True, "message": f"Connected to WordPress at {url}"}

            elif cms_type == "webflow":
                api_url = f"https://api.webflow.com/v2/collections/{credentials.get('collection_id', '')}"
                headers = {"Authorization": f"Bearer {credentials.get('api_token', '')}"}
                resp = requests.get(api_url, headers=headers, timeout=10)
                resp.raise_for_status()
                collection_name = resp.json().get("displayName", "Unknown")
                return {"success": True, "message": f"Connected to Webflow collection: {collection_name}"}

            elif cms_type == "custom":
                endpoint = credentials.get("endpoint_url", "")
                # Just do a HEAD request to check the endpoint is reachable
                resp = requests.head(endpoint, timeout=10)
                return {"success": True, "message": f"Endpoint reachable (HTTP {resp.status_code})"}

            return {"success": False, "message": f"Unknown CMS type: {cms_type}"}

        except requests.exceptions.ConnectionError:
            return {"success": False, "message": "Connection failed — server unreachable"}
        except requests.exceptions.HTTPError as e:
            return {"success": False, "message": f"Authentication failed: {e.response.status_code} {e.response.reason}"}
        except Exception as e:
            return {"success": False, "message": f"Error: {str(e)}"}
