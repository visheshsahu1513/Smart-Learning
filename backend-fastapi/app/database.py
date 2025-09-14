
import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# Load environment variables from .env file for local development
load_dotenv()

if os.environ.get("GAE_ENV") == "standard":
    db_user = os.environ.get("DB_USER")     
    db_pass = os.environ.get("DB_PASS")      
    db_name = os.environ.get("DB_NAME")      
    db_connection_name = os.environ.get("DB_CONNECTION_NAME") 

    SQLALCHEMY_DATABASE_URL = (
        f"postgresql+psycopg2://{db_user}:{db_pass}@/{db_name}"
        f"?host=/cloudsql/{db_connection_name}"
    )
else:
    SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")


engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()