from fastapi import APIRouter
from app.api.v1.endpoints import users, projects, sources, posts, auth, schedules

api_router = APIRouter()
api_router.include_router(auth.router, tags=["auth"], prefix="/auth")
api_router.include_router(users.router, tags=["users"], prefix="/users")
api_router.include_router(projects.router, tags=["projects"], prefix="/projects")
api_router.include_router(sources.router, tags=["sources"], prefix="/sources")
api_router.include_router(posts.router, tags=["posts"], prefix="/posts")
api_router.include_router(schedules.router, tags=["schedules"], prefix="/schedules")
