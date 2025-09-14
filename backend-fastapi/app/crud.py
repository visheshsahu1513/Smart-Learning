from sqlalchemy.orm import Session, joinedload
from fastapi import HTTPException, status
from . import models, schemas

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()


def get_user_by_firebase_uid(db: Session, firebase_uid: str):
    """
    Gets a user by their Firebase UID and EAGERLY LOADS their enrolled courses.
    This ensures that the 'enrolled_courses' attribute is populated.
    """
    return db.query(models.User).options(
        joinedload(models.User.enrolled_courses)
    ).filter(models.User.firebase_uid == firebase_uid).first()

def create_db_user(db: Session, firebase_uid: str, email: str):
    db_user = models.User(email=email, firebase_uid=firebase_uid, role=models.UserRole.student)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def get_course(db: Session, course_id: int):
    return db.query(models.Course).filter(models.Course.id == course_id).first()

def get_courses(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Course).offset(skip).limit(limit).all()

def create_course(db: Session, course: schemas.CourseCreate, owner_id: int):
    db_course = models.Course(**course.model_dump(), owner_id=owner_id)
    db.add(db_course)
    db.commit()
    db.refresh(db_course)
    return db_course

def update_course(db: Session, course_id: int, course_update: schemas.CourseCreate):
    db_course = get_course(db, course_id)
    if not db_course:
        return None
    for key, value in course_update.model_dump(exclude_unset=True).items():
        setattr(db_course, key, value)
    db.add(db_course)
    db.commit()
    db.refresh(db_course)
    return db_course

def delete_course(db: Session, course_id: int):
    db_course = get_course(db, course_id)
    if not db_course:
        return None
    db.delete(db_course)
    db.commit()
    return db_course

def create_enrollment(db: Session, course_id: int, user_id: int):
    course = get_course(db, course_id)
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")
    
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    if course.capacity is not None:
        enrolled_count = db.query(models.enrollment_table).filter_by(course_id=course.id).count()
        
        if enrolled_count >= course.capacity:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT, # 409 Conflict is a good status code for this
                detail="Course capacity has been reached. Cannot enroll."
            )

    if course in user.enrolled_courses:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User already enrolled in this course")

    # If all checks pass, enroll the user
    user.enrolled_courses.append(course)
    db.commit()
    
    return {"message": "Successfully enrolled in course"}

def assign_instructor_to_course(db: Session, course_id: int, instructor_id: int):
    db_course = get_course(db, course_id)
    if not db_course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")

    db_instructor = db.query(models.User).filter(models.User.id == instructor_id).first()
    if not db_instructor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Instructor user not found")
    
    if db_instructor.role not in [models.UserRole.instructor, models.UserRole.admin]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User is not an instructor or admin")

    db_course.owner_id = instructor_id
    db.add(db_course)
    db.commit()
    db.refresh(db_course)
    return db_course

def get_students_for_course(db: Session, course_id: int):
    db_course = get_course(db, course_id)
    if not db_course:
        return None
    return db_course.enrolled_students

def create_course_material(db: Session, course_id: int, title: str, file_path: str, content_type: str) -> models.CourseMaterial:
    """
    Creates a new record for a course material in the database.
    """
    db_material = models.CourseMaterial(
        course_id=course_id,
        title=title,
        file_path=file_path,
        content_type=content_type
    )
    db.add(db_material)
    db.commit()
    db.refresh(db_material)
    return db_material

def get_materials_for_course(db: Session, course_id: int) -> list[models.CourseMaterial]:
    """
    Retrieves all material records associated with a specific course.
    """
    return db.query(models.CourseMaterial).filter(models.CourseMaterial.course_id == course_id).all()

def get_material(db: Session, material_id: int) -> models.CourseMaterial | None:
    """
    Retrieves a single course material by its ID.
    """
    return db.query(models.CourseMaterial).filter(models.CourseMaterial.id == material_id).first()

def delete_material(db: Session, material_id: int) -> models.CourseMaterial | None:
    """
    Deletes a course material record from the database.
    """
    db_material = get_material(db, material_id)
    if db_material:
        db.delete(db_material)
        db.commit()
    return db_material

def get_users(db: Session, skip: int = 0, limit: int = 100):
    """
    Retrieves a list of all users from the database.
    """
    return db.query(models.User).offset(skip).limit(limit).all()