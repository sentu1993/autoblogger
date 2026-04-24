from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.db.session import get_session
from app.db.models import Post, PostStatus
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class PostRead(BaseModel):
    id: int
    project_id: int
    source_url: str
    generated_title: Optional[str]
    status: PostStatus
    published_url: Optional[str]
    created_at: datetime

router = APIRouter()

@router.get("/", response_model=List[PostRead])
def get_posts(project_id: Optional[int] = None, session: Session = Depends(get_session)):
    if project_id:
        statement = select(Post).where(Post.project_id == project_id)
    else:
        statement = select(Post)
    posts = session.exec(statement).all()
    return posts
