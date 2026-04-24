from typing import List, Optional, Dict
from datetime import datetime
from sqlmodel import SQLModel, Field, Relationship, Column, JSON
from enum import Enum


class CMSType(str, Enum):
    WORDPRESS = "wordpress"
    WEBFLOW = "webflow"
    CUSTOM = "custom"


class SourceType(str, Enum):
    RSS = "rss"
    NEWS_API = "news_api"


class PostStatus(str, Enum):
    PENDING = "pending"
    GENERATED = "generated"
    PUBLISHED = "published"
    FAILED = "failed"


class AuthMethod(str, Enum):
    """Authentication methods for custom webhook integrations."""
    NONE = "none"
    API_KEY = "api_key"
    BEARER = "bearer"
    HMAC = "hmac"


class ScheduleType(str, Enum):
    """Types of scheduling strategies."""
    INTERVAL = "interval"
    SPECIFIC_DAYS = "specific_days"
    CRON = "cron"


class IntervalUnit(str, Enum):
    HOURS = "hours"
    DAYS = "days"


class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True)
    hashed_password: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    projects: List["Project"] = Relationship(back_populates="user")


class Project(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    name: str
    cms_type: CMSType
    cms_credentials: Dict = Field(default_factory=dict, sa_column=Column(JSON))
    cta_template: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

    user: User = Relationship(back_populates="projects")
    sources: List["Source"] = Relationship(back_populates="project")
    generation_settings: Optional["GenerationSettings"] = Relationship(back_populates="project")
    schedules: List["Schedule"] = Relationship(back_populates="project")
    posts: List["Post"] = Relationship(back_populates="project")


class Source(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    project_id: int = Field(foreign_key="project.id")
    type: SourceType
    url: str
    is_active: bool = Field(default=True)

    project: Project = Relationship(back_populates="sources")


class GenerationSettings(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    project_id: int = Field(foreign_key="project.id", unique=True)
    primary_keywords: str
    niche: str
    tone: str = Field(default="professional")
    ai_provider: str = Field(default="openai")
    encrypted_ai_api_key: str

    project: Project = Relationship(back_populates="generation_settings")


class Schedule(SQLModel, table=True):
    """
    Flexible scheduling model supporting:
    - Interval-based: every N hours/days
    - Specific days: Mon-Sun picker with specific publish times
    - Cron: raw cron expression for power users
    """
    id: Optional[int] = Field(default=None, primary_key=True)
    project_id: int = Field(foreign_key="project.id")

    # Schedule strategy
    schedule_type: str = Field(default=ScheduleType.INTERVAL)

    # Interval mode: every N hours/days
    interval_value: int = Field(default=1)
    interval_unit: str = Field(default=IntervalUnit.DAYS)

    # Specific days mode: which days of week [0=Mon .. 6=Sun]
    days_of_week: List[int] = Field(default_factory=list, sa_column=Column(JSON))

    # Times to publish each scheduled day: ["09:00", "15:00"]
    publish_times: List[str] = Field(default_factory=list, sa_column=Column(JSON))

    # How many posts to generate per execution run
    posts_per_run: int = Field(default=1)

    # User timezone for accurate scheduling
    timezone: str = Field(default="UTC")

    # Cron mode: raw cron expression for advanced users
    cron_expression: Optional[str] = None

    # Operational state
    is_active: bool = Field(default=True)
    next_run_time: Optional[datetime] = None
    last_run_time: Optional[datetime] = None

    project: Project = Relationship(back_populates="schedules")


class Post(SQLModel, table=True):
    """
    Audit log and content store for every generated article.
    Stores the full HTML, SEO metadata, schema markup, and publication status.
    """
    id: Optional[int] = Field(default=None, primary_key=True)
    project_id: int = Field(foreign_key="project.id")
    source_url: str
    generated_title: Optional[str] = None
    status: PostStatus = Field(default=PostStatus.PENDING)
    published_url: Optional[str] = None
    error_log: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Full generated content
    content_html: Optional[str] = None
    content_schema: Optional[str] = None
    meta_description: Optional[str] = None
    slug: Optional[str] = None
    suggested_tags: List[str] = Field(default_factory=list, sa_column=Column(JSON))

    # Quality metrics
    seo_score: Optional[int] = None  # 0-100

    # Timestamps
    published_at: Optional[datetime] = None

    project: Project = Relationship(back_populates="posts")
