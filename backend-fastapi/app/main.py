# app/main.py
import os
import firebase_admin
from firebase_admin import credentials
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from . import models
from .database import engine
from .routers import auth, users, courses


app = FastAPI(
    title="Smart LMS - FastAPI Service",
    description="This service handles user management, course content, and enrollments.",
    version="1.0.0"
)

origins = [
    "http://localhost:5173",
    "https://smartlearning-300c0.web.app"
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

load_dotenv()
try:
    cred_path = os.getenv("FIREBASE_CREDENTIALS_PATH", "serviceAccountKey.json")
    storage_bucket = os.getenv("FIREBASE_STORAGE_BUCKET")
    if not storage_bucket:
        raise ValueError("CRITICAL: FIREBASE_STORAGE_BUCKET environment variable is not set.")
    cred = credentials.Certificate(cred_path)
    if not firebase_admin._apps:
        firebase_admin.initialize_app(cred, {'storageBucket': storage_bucket})
except Exception as e:
    print(f"CRITICAL: Error initializing Firebase Admin SDK: {e}")
    raise e

models.Base.metadata.create_all(bind=engine)

app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(courses.router, prefix="/api/courses", tags=["Courses"])

@app.get("/", tags=["Root"])
def read_root():
    return {"message": "Welcome to the Smart LMS FastAPI service!"}