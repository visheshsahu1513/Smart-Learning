# app/security.py
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
import firebase_admin
from firebase_admin import auth

from . import crud, models
from .database import get_db

reusable_oauth2 = HTTPBearer(scheme_name="Firebase Token")

def get_current_user(
    db: Session = Depends(get_db), token: HTTPAuthorizationCredentials = Depends(reusable_oauth2)
) -> models.User:
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Bearer token not provided")
    try:
        decoded_token = auth.verify_id_token(token.credentials)
        firebase_uid = decoded_token["uid"]
        user = crud.get_user_by_firebase_uid(db, firebase_uid=firebase_uid)
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found in our database")
        return user
    except auth.InvalidIdTokenError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid Firebase ID token")
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"An error occurred: {e}")

def get_current_admin_user(current_user: models.User = Depends(get_current_user)) -> models.User:
    if current_user.role != models.UserRole.admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="The user does not have admin privileges")
    return current_user

def get_current_course_creator(current_user: models.User = Depends(get_current_user)) -> models.User:
    if current_user.role not in [models.UserRole.admin, models.UserRole.instructor]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User must be an Admin or Instructor to perform this action")
    return current_user

def get_course_owner_or_admin(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
) -> models.Course:
    """
    Dependency that verifies if the current user is the owner of a course or an admin.
    This is for actions like UPLOADING materials or editing the course.
    If authorized, it returns the course object. Otherwise, it raises an exception.
    """
    db_course = crud.get_course(db, course_id=course_id)
    if not db_course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")

    is_admin = current_user.role == models.UserRole.admin
    is_owner = db_course.owner_id == current_user.id

    if not (is_admin or is_owner):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to modify this course"
        )
    return db_course


def get_course_viewer(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
) -> models.Course:
    """
    Dependency that verifies if a user can VIEW a course's content.
    Allowed if they are: an admin, the owner, or an enrolled student.
    """
    db_course = crud.get_course(db, course_id=course_id)
    if not db_course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")

    is_admin = current_user.role == models.UserRole.admin
    is_owner = db_course.owner_id == current_user.id
    # This check works because of the many-to-many relationship we defined in models.py
    is_enrolled = db_course in current_user.enrolled_courses

    if not (is_admin or is_owner or is_enrolled):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to view this course's materials"
        )
    return db_course