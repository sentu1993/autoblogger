from typing import Optional, Dict
from pydantic import BaseModel
from app.db.models import CMSType

class ProjectBase(BaseModel):
    name: str
    cms_type: CMSType
    cms_credentials: Dict = {}
    cta_template: Optional[str] = None

class ProjectCreate(ProjectBase):
    pass

class ProjectRead(ProjectBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True
