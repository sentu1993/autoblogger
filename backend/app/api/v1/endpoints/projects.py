from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.db.session import get_session
from app.db.models import Project, User
from app.schemas.project import ProjectCreate, ProjectRead
from typing import List

router = APIRouter()

@router.post("/", response_model=ProjectRead)
def create_project(project: ProjectCreate, session: Session = Depends(get_session)):
    # For now, we assume a single user with ID 1
    db_project = Project.from_orm(project)
    db_project.user_id = 1 
    session.add(db_project)
    session.commit()
    session.refresh(db_project)
    return db_project

@router.get("/", response_model=List[ProjectRead])
def get_projects(session: Session = Depends(get_session)):
    projects = session.exec(select(Project)).all()
    return projects

@router.get("/{project_id}", response_model=ProjectRead)
def get_project(project_id: int, session: Session = Depends(get_session)):
    project = session.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project

@router.post("/test-connection")
def test_connection(data: dict):
    from app.services.cms import CMSService
    cms_type = data.get("cms_type")
    credentials = data.get("credentials")
    if not cms_type or not credentials:
        raise HTTPException(status_code=400, detail="Missing cms_type or credentials")
    
    result = CMSService.test_connection(cms_type, credentials)
    return result
