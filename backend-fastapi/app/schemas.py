# app/schemas.py
from pydantic import BaseModel, EmailStr
from typing import List
from .models import UserRole
from datetime import datetime

# --- User Schemas ---
class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    firebase_uid: str

class User(UserBase):
    id: int
    firebase_uid: str
    role: UserRole

    class Config:
        from_attributes = True

# --- Course Schemas ---
class CourseBase(BaseModel):
    title: str
    description: str | None = None
    capacity: int | None = None

class CourseCreate(CourseBase):
    pass

class Course(CourseBase):
    id: int
    owner_id: int

    class Config:
        from_attributes = True

# --- Auth Schemas ---
class Token(BaseModel):
    id_token: str

class PasswordResetRequest(BaseModel):
    email: EmailStr

class AssignInstructorRequest(BaseModel):
    instructor_id: int

class Student(BaseModel):
    id: int
    email: EmailStr

    class Config:
        from_attributes = True

# A new, more detailed Course schema that includes the list of enrolled students
class CourseWithStudents(Course):
    enrolled_students: List[Student] = []

class CourseMaterialBase(BaseModel):
    title: str

class CourseMaterial(CourseMaterialBase):
    id: int
    content_type: str
    created_at: datetime
    
    class Config:
        from_attributes = True

# This special schema will be used for the "View Materials" response.
# It includes the temporary, secure download URL we will generate.
class CourseMaterialWithUrl(CourseMaterial):
    download_url: str

class UserWithEnrollments(User): # It inherits all fields from the User schema
    enrolled_course_ids: List[int] = []