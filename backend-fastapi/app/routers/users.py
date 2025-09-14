# app/routers/users.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from .. import schemas, models, security, crud
from ..database import get_db


router = APIRouter(
    tags=["Users"]
)

@router.get("/", response_model=List[schemas.User], summary="Get all users (for Admins)")
def read_all_users(
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(security.get_current_admin_user)
):
    """
    Retrieve a list of all users. **Requires Admin privileges.**
    This is used to populate the 'Assign Instructor' dropdown.
    """
    users = crud.get_users(db=db)
    return users

@router.get("/me", response_model=schemas.UserWithEnrollments, summary="Get current user's profile with enrollments")
def see_profile(current_user: models.User = Depends(security.get_current_user)):
    """
    Get the profile of the currently authenticated user, including a list of
    the course IDs they are enrolled in.
    """
    print("--- DIAGNOSING /users/me ENDPOINT ---")
    try:
        print(f"Raw enrolled_courses from SQLAlchemy: {current_user.enrolled_courses}")
        enrolled_ids = [course.id for course in current_user.enrolled_courses]
        print(f"Calculated enrolled_ids: {enrolled_ids}")
    except Exception as e:
        print(f"An error occurred during processing: {e}")
        enrolled_ids = []
    print("------------------------------------")

    response_data = {
        "id": current_user.id,
        "email": current_user.email,
        "firebase_uid": current_user.firebase_uid,
        "role": current_user.role,
        "enrolled_course_ids": enrolled_ids
    }
    
    return response_data

































# # app/routers/users.py
# from fastapi import APIRouter, Depends
# from sqlalchemy.orm import Session
# from typing import List # <-- Make sure this is imported at the top
# from .. import schemas, models, security, crud
# from ..database import get_db

# router = APIRouter(
#     prefix="/users",
#     tags=["Users"]
# )

# # @router.get("/me", response_model=schemas.User, summary="Get current user's profile")
# # def see_profile(current_user: models.User = Depends(security.get_current_user)):
# #     """
# #     Get the profile of the currently authenticated user.
# #     Requires a valid Firebase ID token in the Authorization header.
# #     """
# #     return current_user

# @router.get("/", response_model=List[schemas.User], summary="Get all users (for Admins)")
# def read_all_users(
#     db: Session = Depends(get_db),
#     current_admin: models.User = Depends(security.get_current_admin_user)
# ):
#     """
#     Retrieve a list of all users. **Requires Admin privileges.**
#     This is used to populate the 'Assign Instructor' dropdown.
#     """
#     users = crud.get_users(db=db)
#     return users

# # Change the response_model to our new, more detailed schema
# @router.get("/me", response_model=schemas.UserWithEnrollments, summary="Get current user's profile with enrollments")
# def see_profile(current_user: models.User = Depends(security.get_current_user)):
#     """
#     Get the profile of the currently authenticated user, including a list of
#     the course IDs they are enrolled in.
#     """
#     # --- START OF DIAGNOSTIC BLOCK ---
#     print("--- DIAGNOSING /users/me ENDPOINT ---")
#     try:
#         # This will print the list of Course objects. If it's empty, we know why.
#         print(f"Raw enrolled_courses from SQLAlchemy: {current_user.enrolled_courses}")
        
#         # This will print the list of IDs we are calculating.
#         enrolled_ids = [course.id for course in current_user.enrolled_courses]
#         print(f"Calculated enrolled_ids: {enrolled_ids}")
#     except Exception as e:
#         print(f"An error occurred during processing: {e}")
#         enrolled_ids = [] # Default to empty list on error
#     print("------------------------------------")
#     # --- END OF DIAGNOSTIC BLOCK ---

#     # Manually build the response object to match the new schema.
#     response_data = {
#         "id": current_user.id,
#         "email": current_user.email,
#         "firebase_uid": current_user.firebase_uid,
#         "role": current_user.role,
#         "enrolled_course_ids": enrolled_ids
#     }
    
#     return response_data