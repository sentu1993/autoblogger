from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.db.session import get_session
from app.db.models import Schedule, Project
from app.schemas.project import ScheduleCreate, ScheduleRead, ScheduleUpdate
from typing import List
from datetime import datetime

router = APIRouter()

@router.post("/", response_model=ScheduleRead)
def create_schedule(schedule: ScheduleCreate, session: Session = Depends(get_session)):
    project = session.get(Project, schedule.project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    db_schedule = Schedule.from_orm(schedule)
    # Initialize next_run_time if needed, or let the worker handle it
    session.add(db_schedule)
    session.commit()
    session.refresh(db_schedule)
    return db_schedule

@router.get("/", response_model=List[ScheduleRead])
def get_schedules(project_id: int, session: Session = Depends(get_session)):
    statement = select(Schedule).where(Schedule.project_id == project_id)
    schedules = session.exec(statement).all()
    return schedules

@router.get("/{schedule_id}", response_model=ScheduleRead)
def get_schedule(schedule_id: int, session: Session = Depends(get_session)):
    schedule = session.get(Schedule, schedule_id)
    if not schedule:
        raise HTTPException(status_code=404, detail="Schedule not found")
    return schedule

@router.patch("/{schedule_id}", response_model=ScheduleRead)
def update_schedule(schedule_id: int, schedule_update: ScheduleUpdate, session: Session = Depends(get_session)):
    db_schedule = session.get(Schedule, schedule_id)
    if not db_schedule:
        raise HTTPException(status_code=404, detail="Schedule not found")
    
    schedule_data = schedule_update.dict(exclude_unset=True)
    for key, value in schedule_data.items():
        setattr(db_schedule, key, value)
    
    session.add(db_schedule)
    session.commit()
    session.refresh(db_schedule)
    return db_schedule

@router.delete("/{schedule_id}")
def delete_schedule(schedule_id: int, session: Session = Depends(get_session)):
    schedule = session.get(Schedule, schedule_id)
    if not schedule:
        raise HTTPException(status_code=404, detail="Schedule not found")
    session.delete(schedule)
    session.commit()
    return {"ok": True}

@router.post("/{schedule_id}/trigger")
def trigger_schedule(schedule_id: int, session: Session = Depends(get_session)):
    from app.worker.tasks import process_schedule_task
    schedule = session.get(Schedule, schedule_id)
    if not schedule:
        raise HTTPException(status_code=404, detail="Schedule not found")
    
    # Trigger the task manually
    process_schedule_task.delay(schedule.id)
    return {"message": "Schedule triggered successfully"}
