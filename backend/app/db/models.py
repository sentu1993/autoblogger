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
    id: Optional[int] = Field(default=None, primary_key=True)
    project_id: int = Field(foreign_key="project.id")
    frequency_hours: int
    next_run_time: datetime
    
    project: Project = Relationship(back_populates="schedules")

class Post(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    project_id: int = Field(foreign_key="project.id")
    source_url: str
    generated_title: Optional[str] = None
    status: PostStatus = Field(default=PostStatus.PENDING)
    published_url: Optional[str] = None
    error_log: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    project: Project = Relationship(back_populates="posts")
