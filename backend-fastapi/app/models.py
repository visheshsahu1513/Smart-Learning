# app/models.py
import enum
from sqlalchemy import Column, Integer, String, ForeignKey, Table, Enum
from sqlalchemy.orm import relationship
from .database import Base
from sqlalchemy import DateTime
from sqlalchemy.sql import func

# Define the Role enum
class UserRole(str, enum.Enum):
    student = "student"
    instructor = "instructor"
    admin = "admin"

# Association table for the many-to-many relationship between users and courses (enrollments)
enrollment_table = Table('enrollments', Base.metadata,
    Column('user_id', Integer, ForeignKey('users.id'), primary_key=True),
    Column('course_id', Integer, ForeignKey('courses.id'), primary_key=True)
)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    firebase_uid = Column(String, unique=True, index=True, nullable=False)
    role = Column(Enum(UserRole), nullable=False, default=UserRole.student)

    # Relationship to courses this user has created (as an instructor/admin)
    owned_courses = relationship("Course", back_populates="owner")
    
    # Many-to-many relationship for courses this user is enrolled in
    enrolled_courses = relationship("Course", secondary=enrollment_table, back_populates="enrolled_students")

class CourseMaterial(Base):
    __tablename__ = "course_materials"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    # This will store the path in Firebase Storage, e.g., "courses/1/material.pdf"
    file_path = Column(String, nullable=False, unique=True)
    content_type = Column(String, nullable=False)
    
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationship back to the course it belongs to
    course = relationship("Course", back_populates="materials")

class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True, nullable=False)
    description = Column(String, nullable=True)
    capacity = Column(Integer, nullable=True)
    owner_id = Column(Integer, ForeignKey("users.id"))

    

    # Relationship back to the user who owns the course
    owner = relationship("User", back_populates="owned_courses")
    
    # Many-to-many relationship for students enrolled in this course
    enrolled_students = relationship("User", secondary=enrollment_table, back_populates="enrolled_courses")
    materials = relationship("CourseMaterial", back_populates="course", cascade="all, delete-orphan")