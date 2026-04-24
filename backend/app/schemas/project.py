from typing import Optional, Dict, List, Union, Literal
from pydantic import BaseModel, field_validator, model_validator
from app.db.models import CMSType, AuthMethod, ScheduleType, IntervalUnit


# ──────────────────────────────────────────────────────────
# Platform-Specific CMS Credential Schemas
# ──────────────────────────────────────────────────────────

class WordPressCredentials(BaseModel):
    """
    WordPress REST API authentication via Application Passwords.
    Requires: Site URL (HTTPS), WP Username, Application Password.
    Endpoint: {url}/wp-json/wp/v2/posts
    """
    url: str
    username: str
    app_password: str

    @field_validator("url")
    @classmethod
    def validate_url(cls, v: str) -> str:
        v = v.rstrip("/")
        if not v.startswith("https://") and not v.startswith("http://localhost"):
            raise ValueError("WordPress site URL must use HTTPS for security")
        return v


class WebflowCredentials(BaseModel):
    """
    Webflow CMS API v2 authentication via Bearer Token.
    Requires: API Token (from Site Settings > Apps & Integrations),
              Site ID (for publishing), Collection ID (target CMS collection).
    Endpoint: POST https://api.webflow.com/v2/collections/{collection_id}/items
    """
    api_token: str
    site_id: str
    collection_id: str

    @field_validator("api_token")
    @classmethod
    def validate_token(cls, v: str) -> str:
        if len(v) < 10:
            raise ValueError("API token appears too short — check your Webflow settings")
        return v


class CustomWebhookCredentials(BaseModel):
    """
    Custom webhook integration with configurable authentication.
    Supports: No auth, API Key header, Bearer token, HMAC-SHA256 signature.
    """
    endpoint_url: str
    auth_method: AuthMethod = AuthMethod.NONE
    auth_header_name: str = "X-API-Key"  # Customizable header name
    auth_secret: str = ""  # The secret/token/key value

    @field_validator("endpoint_url")
    @classmethod
    def validate_endpoint(cls, v: str) -> str:
        if not v.startswith("http://") and not v.startswith("https://"):
            raise ValueError("Endpoint URL must start with http:// or https://")
        return v

    @model_validator(mode="after")
    def validate_auth_config(self):
        if self.auth_method != AuthMethod.NONE and not self.auth_secret:
            raise ValueError(f"auth_secret is required when auth_method is '{self.auth_method}'")
        return self


# ──────────────────────────────────────────────────────────
# Project Schemas
# ──────────────────────────────────────────────────────────

class ProjectBase(BaseModel):
    name: str
    cms_type: CMSType
    cms_credentials: Dict = {}
    cta_template: Optional[str] = None


class ProjectCreate(ProjectBase):
    """
    Validates that cms_credentials match the expected schema for the selected CMS type.
    """

    @model_validator(mode="after")
    def validate_credentials_for_cms(self):
        creds = self.cms_credentials
        if self.cms_type == CMSType.WORDPRESS:
            WordPressCredentials(**creds)
        elif self.cms_type == CMSType.WEBFLOW:
            WebflowCredentials(**creds)
        elif self.cms_type == CMSType.CUSTOM:
            CustomWebhookCredentials(**creds)
        return self


class ProjectRead(ProjectBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True


# ──────────────────────────────────────────────────────────
# Schedule Schemas
# ──────────────────────────────────────────────────────────

class ScheduleBase(BaseModel):
    project_id: int
    schedule_type: str = ScheduleType.INTERVAL
    interval_value: int = 1
    interval_unit: str = IntervalUnit.DAYS
    days_of_week: List[int] = []
    publish_times: List[str] = []
    posts_per_run: int = 1
    timezone: str = "UTC"
    cron_expression: Optional[str] = None
    is_active: bool = True

    @field_validator("days_of_week")
    @classmethod
    def validate_days(cls, v: List[int]) -> List[int]:
        for day in v:
            if day < 0 or day > 6:
                raise ValueError(f"Invalid day of week: {day}. Must be 0 (Mon) through 6 (Sun)")
        return sorted(set(v))

    @field_validator("publish_times")
    @classmethod
    def validate_times(cls, v: List[str]) -> List[str]:
        import re
        for t in v:
            if not re.match(r"^\d{2}:\d{2}$", t):
                raise ValueError(f"Invalid time format: {t}. Must be HH:MM")
            hours, mins = int(t[:2]), int(t[3:])
            if hours > 23 or mins > 59:
                raise ValueError(f"Invalid time: {t}")
        return sorted(set(v))

    @field_validator("posts_per_run")
    @classmethod
    def validate_posts_per_run(cls, v: int) -> int:
        if v < 1 or v > 20:
            raise ValueError("posts_per_run must be between 1 and 20")
        return v


class ScheduleCreate(ScheduleBase):
    pass


class ScheduleUpdate(BaseModel):
    schedule_type: Optional[str] = None
    interval_value: Optional[int] = None
    interval_unit: Optional[str] = None
    days_of_week: Optional[List[int]] = None
    publish_times: Optional[List[str]] = None
    posts_per_run: Optional[int] = None
    timezone: Optional[str] = None
    cron_expression: Optional[str] = None
    is_active: Optional[bool] = None


class ScheduleRead(ScheduleBase):
    id: int
    next_run_time: Optional[str] = None
    last_run_time: Optional[str] = None

    class Config:
        from_attributes = True
