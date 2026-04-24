from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.db.session import get_session
from app.db.models import Source
from pydantic import BaseModel
from typing import List
from app.db.models import SourceType

class SourceCreate(BaseModel):
    project_id: int
    type: SourceType
    url: str

class SourceRead(SourceCreate):
    id: int
    is_active: bool

router = APIRouter()

@router.post("/", response_model=SourceRead)
def add_source(source: SourceCreate, session: Session = Depends(get_session)):
    db_source = Source.from_orm(source)
    session.add(db_source)
    session.commit()
    session.refresh(db_source)
    return db_source

@router.get("/", response_model=List[SourceRead])
def get_sources(project_id: int, session: Session = Depends(get_session)):
    statement = select(Source).where(Source.project_id == project_id)
    sources = session.exec(statement).all()
    return sources
