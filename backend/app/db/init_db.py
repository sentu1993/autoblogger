from sqlmodel import SQLModel
from app.db.session import engine
from app.db.models import *

def init_db():
    SQLModel.metadata.create_all(engine)

if __name__ == "__main__":
    init_db()
