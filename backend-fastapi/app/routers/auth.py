
import os
import requests
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from firebase_admin import auth

from .. import schemas, crud
from ..database import get_db


router = APIRouter(
    tags=["Authentication"]
)

FIREBASE_WEB_API_KEY = os.getenv("FIREBASE_WEB_API_KEY")
if not FIREBASE_WEB_API_KEY:
    raise ValueError("FIREBASE_WEB_API_KEY environment variable not set")

@router.post("/signup", response_model=schemas.User, status_code=status.HTTP_201_CREATED)
def create_user_in_db(user_data: schemas.UserCreate, db: Session = Depends(get_db)):
    """
    Creates a user record in our local database.
    This endpoint is called AFTER the user has already been created in Firebase
    by the frontend. It syncs the user into our PostgreSQL database.
    """
    # Check if a user with this email or Firebase UID already exists in our local DB
    db_user_by_email = crud.get_user_by_email(db, email=user_data.email)
    if db_user_by_email:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered in our database.")
    
    db_user_by_uid = crud.get_user_by_firebase_uid(db, firebase_uid=user_data.firebase_uid)
    if db_user_by_uid:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Firebase UID already exists in our database.")

    # If checks pass, create the user in our local database.
    new_user = crud.create_db_user(db=db, firebase_uid=user_data.firebase_uid, email=user_data.email)
    return new_user


@router.post("/login", response_model=schemas.Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    """
    Login user with email and password to get a Firebase ID token.
    Uses standard OAuth2 form data: 'username' (which is email) and 'password'.
    """
    try:
        # Use Firebase Auth REST API to sign in with email and password
        rest_api_url = f"https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key={FIREBASE_WEB_API_KEY}"
        payload = {
            "email": form_data.username,
            "password": form_data.password,
            "returnSecureToken": True
        }
        response = requests.post(rest_api_url, json=payload)
        response.raise_for_status() # Raise an exception for bad status codes (4xx or 5xx)
        
        token_data = response.json()
        return {"id_token": token_data["idToken"]}

    except requests.exceptions.HTTPError as e:
        # Extract Firebase's error message
        error_json = e.response.json().get("error", {})
        error_message = error_json.get("message", "Invalid credentials")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Login failed: {error_message}",
            headers={"WWW-Authenticate": "Bearer"},
        )

@router.post("/forgot-password", status_code=status.HTTP_200_OK)
def forgot_password(request: schemas.PasswordResetRequest):
    """
    Triggers the Firebase password reset email flow.
    """
    try:
        email = request.email
        link = auth.generate_password_reset_link(email)
        print(f"Password reset link generated for {email}: {link}") # For debugging ONLY.
        return {"message": "If an account with this email exists, a password reset link has been sent."}
    except auth.UserNotFoundError:
        return {"message": "If an account with this email exists, a password reset link has been sent."}
    except Exception as e:
        print(f"An unexpected error occurred during password reset: {e}") # For debugging
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while processing the request."
        )
    





















# # app/routers/auth.py
# import os
# import requests
# from fastapi import APIRouter, Depends, HTTPException, status
# from fastapi.security import OAuth2PasswordRequestForm
# from sqlalchemy.orm import Session
# from firebase_admin import auth

# from .. import schemas, crud
# from ..database import get_db

# # --- THE FIX IS HERE ---
# # We have removed the redundant prefix="/auth" from this line.
# # The prefix is now correctly handled only in main.py.
# router = APIRouter(
#     tags=["Authentication"]
# )

# # Get Firebase Web API Key from environment variables for security
# FIREBASE_WEB_API_KEY = os.getenv("FIREBASE_WEB_API_KEY")
# if not FIREBASE_WEB_API_KEY:
#     raise ValueError("FIREBASE_WEB_API_KEY environment variable not set")

# # --- NEW: Modified /signup endpoint ---
# @router.post("/signup", response_model=schemas.User, status_code=status.HTTP_201_CREATED)
# def create_user_in_db(user_data: schemas.UserCreate, db: Session = Depends(get_db)):
#     """
#     Creates a user record in our local database.
#     This endpoint is called AFTER the user has already been created in Firebase
#     by the frontend. It syncs the user into our PostgreSQL database.
#     """
#     # Check if a user with this email or Firebase UID already exists in our local DB
#     db_user_by_email = crud.get_user_by_email(db, email=user_data.email)
#     if db_user_by_email:
#         raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered in our database.")
    
#     db_user_by_uid = crud.get_user_by_firebase_uid(db, firebase_uid=user_data.firebase_uid)
#     if db_user_by_uid:
#         raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Firebase UID already exists in our database.")

#     # If checks pass, create the user in our local database.
#     # Notice we no longer call auth.create_user().
#     new_user = crud.create_db_user(db=db, firebase_uid=user_data.firebase_uid, email=user_data.email)
#     return new_user


# @router.post("/login", response_model=schemas.Token)
# def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
#     """
#     Login user with email and password to get a Firebase ID token.
#     Uses standard OAuth2 form data: 'username' (which is email) and 'password'.
#     """
#     try:
#         # Use Firebase Auth REST API to sign in with email and password
#         rest_api_url = f"https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key={FIREBASE_WEB_API_KEY}"
#         payload = {
#             "email": form_data.username,
#             "password": form_data.password,
#             "returnSecureToken": True
#         }
#         response = requests.post(rest_api_url, json=payload)
#         response.raise_for_status() # Raise an exception for bad status codes (4xx or 5xx)
        
#         token_data = response.json()
#         return {"id_token": token_data["idToken"]}

#     except requests.exceptions.HTTPError as e:
#         # Extract Firebase's error message
#         error_json = e.response.json().get("error", {})
#         error_message = error_json.get("message", "Invalid credentials")
#         raise HTTPException(
#             status_code=status.HTTP_401_UNAUTHORIZED,
#             detail=f"Login failed: {error_message}",
#             headers={"WWW-Authenticate": "Bearer"},
#         )

# @router.post("/forgot-password", status_code=status.HTTP_200_OK)
# def forgot_password(request: schemas.PasswordResetRequest):
#     """
#     Triggers the Firebase password reset email flow.
#     """
#     try:
#         email = request.email
#         link = auth.generate_password_reset_link(email)
#         print(f"Password reset link generated for {email}: {link}") # For debugging ONLY.
#         return {"message": "If an account with this email exists, a password reset link has been sent."}
#     except auth.UserNotFoundError:
#         return {"message": "If an account with this email exists, a password reset link has been sent."}
#     except Exception as e:
#         print(f"An unexpected error occurred during password reset: {e}") # For debugging
#         raise HTTPException(
#             status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
#             detail="An error occurred while processing the request."
#         )
#  # app/routers/auth.py
# # import os
# # import requests
# # from fastapi import APIRouter, Depends, HTTPException, status
# # from fastapi.security import OAuth2PasswordRequestForm
# # from sqlalchemy.orm import Session
# # from firebase_admin import auth

# # from .. import schemas, crud
# # from ..database import get_db

# # router = APIRouter(
# #     prefix="/auth",
# #     tags=["Authentication"]
# # )

# # # Get Firebase Web API Key from environment variables for security
# # FIREBASE_WEB_API_KEY = os.getenv("FIREBASE_WEB_API_KEY")
# # if not FIREBASE_WEB_API_KEY:
# #     raise ValueError("FIREBASE_WEB_API_KEY environment variable not set")

# # # --- NEW: Modified /signup endpoint ---
# # @router.post("/signup", response_model=schemas.User, status_code=status.HTTP_201_CREATED)
# # def create_user_in_db(user_data: schemas.UserCreate, db: Session = Depends(get_db)):
# #     """
# #     Creates a user record in our local database.
# #     This endpoint is called AFTER the user has already been created in Firebase
# #     by the frontend. It syncs the user into our PostgreSQL database.
# #     """
# #     # Check if a user with this email or Firebase UID already exists in our local DB
# #     db_user_by_email = crud.get_user_by_email(db, email=user_data.email)
# #     if db_user_by_email:
# #         raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered in our database.")
    
# #     db_user_by_uid = crud.get_user_by_firebase_uid(db, firebase_uid=user_data.firebase_uid)
# #     if db_user_by_uid:
# #         raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Firebase UID already exists in our database.")

# #     # If checks pass, create the user in our local database.
# #     # Notice we no longer call auth.create_user().
# #     new_user = crud.create_db_user(db=db, firebase_uid=user_data.firebase_uid, email=user_data.email)
# #     return new_user


# # @router.post("/login", response_model=schemas.Token)
# # def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
# #     """
# #     Login user with email and password to get a Firebase ID token.
# #     Uses standard OAuth2 form data: 'username' (which is email) and 'password'.
# #     """
# #     try:
# #         # Use Firebase Auth REST API to sign in with email and password
# #         rest_api_url = f"https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key={FIREBASE_WEB_API_KEY}"
# #         payload = {
# #             "email": form_data.username,
# #             "password": form_data.password,
# #             "returnSecureToken": True
# #         }
# #         response = requests.post(rest_api_url, json=payload)
# #         response.raise_for_status() # Raise an exception for bad status codes (4xx or 5xx)
        
# #         token_data = response.json()
# #         return {"id_token": token_data["idToken"]}

# #     except requests.exceptions.HTTPError as e:
# #         # Extract Firebase's error message
# #         error_json = e.response.json().get("error", {})
# #         error_message = error_json.get("message", "Invalid credentials")
# #         raise HTTPException(
# #             status_code=status.HTTP_401_UNAUTHORIZED,
# #             detail=f"Login failed: {error_message}",
# #             headers={"WWW-Authenticate": "Bearer"},
# #         )

# # @router.post("/forgot-password", status_code=status.HTTP_200_OK)
# # def forgot_password(request: schemas.PasswordResetRequest):
# #     """
# #     Triggers the Firebase password reset email flow.
# #     """
# #     try:
# #         email = request.email
# #         link = auth.generate_password_reset_link(email)
# #         print(f"Password reset link generated for {email}: {link}") # For debugging ONLY.
# #         return {"message": "If an account with this email exists, a password reset link has been sent."}
# #     except auth.UserNotFoundError:
# #         return {"message": "If an account with this email exists, a password reset link has been sent."}
# #     except Exception as e:
# #         print(f"An unexpected error occurred during password reset: {e}") # For debugging
# #         raise HTTPException(
# #             status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
# #             detail="An error occurred while processing the request."
# #         )