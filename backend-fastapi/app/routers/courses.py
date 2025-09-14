from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List

from .. import schemas, crud, models, security
from ..database import get_db

from firebase_admin import storage
import uuid
from datetime import timedelta

router = APIRouter(
    tags=["Courses & Enrollments"]
)

@router.post("/", response_model=schemas.Course, status_code=status.HTTP_201_CREATED)
def create_new_course(
    course: schemas.CourseCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.get_current_course_creator)
):
    """
    Create a new course. **Requires Admin or Instructor privileges.**
    """
    return crud.create_course(db=db, course=course, owner_id=current_user.id)


@router.get("/", response_model=List[schemas.Course])
def read_all_courses(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Retrieve a list of all courses. This is a public endpoint."""
    courses = crud.get_courses(db, skip=skip, limit=limit)
    return courses

@router.get("/{course_id}", response_model=schemas.Course)
def read_single_course(course_id: int, db: Session = Depends(get_db)):
    """Retrieve details of a single course. This is a public endpoint."""
    db_course = crud.get_course(db, course_id=course_id)
    if db_course is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")
    return db_course

@router.put("/{course_id}", response_model=schemas.Course)
def update_existing_course(
    course_id: int,
    course_update: schemas.CourseCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.get_current_user)
):
    
    db_course = crud.get_course(db, course_id)
    if db_course is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")

    is_admin = current_user.role == models.UserRole.admin
    is_owner = db_course.owner_id == current_user.id

    if not (is_admin or is_owner):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to update this course")

    return crud.update_course(db, course_id=course_id, course_update=course_update)

@router.delete("/{course_id}", response_model=schemas.Course)
def delete_existing_course(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.get_current_user)
):
    """
    Delete a course.
    - **Admins** can delete any course.
    - **Instructors** can only delete courses they own.
    """
    db_course = crud.get_course(db, course_id)
    if db_course is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")

    is_admin = current_user.role == models.UserRole.admin
    is_owner = db_course.owner_id == current_user.id

    if not (is_admin or is_owner):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to delete this course")

    crud.delete_course(db, course_id=course_id)
    return db_course

@router.post(
    "/{course_id}/materials",
    response_model=schemas.CourseMaterial,
    status_code=status.HTTP_201_CREATED,
    summary="Upload a new course material"
)
def upload_course_material(
    course_id: int,
    file: UploadFile = File(..., description="The material file to upload."),
    title: str = File(..., description="A title for the material."),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.get_course_owner_or_admin)
):
    """
    Upload a material file for a specific course.
    - **Requires Admin or Instructor (owner) privileges.**
    """
    try:
        bucket = storage.bucket()
        file_extension = file.filename.split('.')[-1]
        file_path = f"courses/{course_id}/materials/{uuid.uuid4()}.{file_extension}"
        blob = bucket.blob(file_path)
        blob.upload_from_file(file.file, content_type=file.content_type)
        db_material = crud.create_course_material(
            db=db,
            course_id=course_id,
            title=title,
            file_path=file_path,
            content_type=file.content_type
        )
        return db_material
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to upload file: {e}")

@router.get(
    "/{course_id}/materials",
    response_model=List[schemas.CourseMaterialWithUrl],
    summary="View all materials for a course"
)
def view_course_materials(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.get_course_viewer)
):
    """
    View a list of materials for a course.
    - **Requires Admin, Instructor (owner), or enrolled Student privileges.**
    - Returns temporary, secure download URLs for each file.
    """
    db_materials = crud.get_materials_for_course(db, course_id=course_id)
    response_materials = []
    bucket = storage.bucket()
    for material in db_materials:
        blob = bucket.blob(material.file_path)
        download_url = blob.generate_signed_url(version="v4", expiration=timedelta(hours=1))
        material_with_url = schemas.CourseMaterialWithUrl(
            id=material.id,
            title=material.title,
            content_type=material.content_type,
            created_at=material.created_at,
            download_url=download_url
        )
        response_materials.append(material_with_url)
    return response_materials

@router.post("/{course_id}/enroll", status_code=status.HTTP_201_CREATED)
def enroll_in_course(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.get_current_user)
):
    """
    Enroll the current authenticated user (student) in a course.
    """
    if current_user.role != models.UserRole.student:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only students can enroll in courses")
    return crud.create_enrollment(db=db, course_id=course_id, user_id=current_user.id)

@router.patch("/{course_id}/assign-instructor", response_model=schemas.Course)
def assign_instructor(
    course_id: int,
    request: schemas.AssignInstructorRequest,
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(security.get_current_admin_user)
):
    """
    Assign a new instructor to a course. **Requires Admin privileges.**
    """
    return crud.assign_instructor_to_course(
        db=db, course_id=course_id, instructor_id=request.instructor_id
    )

@router.get("/{course_id}/students", response_model=List[schemas.Student])
def view_enrolled_students(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.get_current_user)
):
    """
    View a list of students enrolled in a specific course.
    - **Requires Admin or Instructor privileges.**
    """
    db_course = crud.get_course(db, course_id)
    if db_course is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")

    allowed_roles = [models.UserRole.admin, models.UserRole.instructor]
    if current_user.role not in allowed_roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only Admins and Instructors can view enrolled students."
        )
    students = crud.get_students_for_course(db, course_id=course_id)
    return students

























# # app/routers/courses.py
# from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
# from sqlalchemy.orm import Session
# from typing import List

# from .. import schemas, crud, models, security
# from ..database import get_db

# from firebase_admin import storage
# import uuid
# from datetime import timedelta

# router = APIRouter(
#     prefix="/courses",
#     tags=["Courses & Enrollments"]
# )

# @router.post("/", response_model=schemas.Course, status_code=status.HTTP_201_CREATED)
# def create_new_course(
#     course: schemas.CourseCreate,
#     db: Session = Depends(get_db),
#     current_user: models.User = Depends(security.get_current_course_creator)
# ):
#     """
#     Create a new course. **Requires Admin or Instructor privileges.**
#     """
#     return crud.create_course(db=db, course=course, owner_id=current_user.id)

# @router.get("/", response_model=List[schemas.Course])
# def read_all_courses(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
#     """Retrieve a list of all courses. This is a public endpoint."""
#     courses = crud.get_courses(db, skip=skip, limit=limit)
#     return courses

# @router.get("/{course_id}", response_model=schemas.Course)
# def read_single_course(course_id: int, db: Session = Depends(get_db)):
#     """Retrieve details of a single course. This is a public endpoint."""
#     db_course = crud.get_course(db, course_id=course_id)
#     if db_course is None:
#         raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")
#     return db_course

# @router.put("/{course_id}", response_model=schemas.Course)
# def update_existing_course(
#     course_id: int,
#     course_update: schemas.CourseCreate,
#     db: Session = Depends(get_db),
#     current_user: models.User = Depends(security.get_current_user)
# ):
#     """
#     Update a course.
#     - **Admins** can update any course.
#     - **Instructors** can only update courses they own.
#     """
#     db_course = crud.get_course(db, course_id)
#     if db_course is None:
#         raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")

#     is_admin = current_user.role == models.UserRole.admin
#     is_owner = db_course.owner_id == current_user.id

#     if not (is_admin or is_owner):
#         raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to update this course")

#     return crud.update_course(db, course_id=course_id, course_update=course_update)

# @router.delete("/{course_id}", response_model=schemas.Course)
# def delete_existing_course(
#     course_id: int,
#     db: Session = Depends(get_db),
#     current_user: models.User = Depends(security.get_current_user)
# ):
#     """
#     Delete a course.
#     - **Admins** can delete any course.
#     - **Instructors** can only delete courses they own.
#     """
#     db_course = crud.get_course(db, course_id)
#     if db_course is None:
#         raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")

#     is_admin = current_user.role == models.UserRole.admin
#     is_owner = db_course.owner_id == current_user.id

#     if not (is_admin or is_owner):
#         raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to delete this course")

#     crud.delete_course(db, course_id=course_id)
#     return db_course

# @router.post(
#     "/{course_id}/materials",
#     response_model=schemas.CourseMaterial,
#     status_code=status.HTTP_201_CREATED,
#     summary="Upload a new course material"
# )
# def upload_course_material(
#     course_id: int, # We get course_id from the path
#     file: UploadFile = File(..., description="The material file to upload."),
#     title: str = File(..., description="A title for the material."),
#     db: Session = Depends(get_db),
#     # This dependency ensures only the owner or an admin can upload.
#     # It also conveniently fetches the course object for us.
#     current_user: models.User = Depends(security.get_course_owner_or_admin)
# ):
#     """
#     Upload a material file for a specific course.
#     - **Requires Admin or Instructor (owner) privileges.**
#     """
#     try:
#         bucket = storage.bucket()
#         # Create a unique path for the file in Firebase Storage to avoid name collisions
#         file_extension = file.filename.split('.')[-1]
#         # Path format: courses/<course_id>/materials/<unique_id>.<extension>
#         file_path = f"courses/{course_id}/materials/{uuid.uuid4()}.{file_extension}"
        
#         blob = bucket.blob(file_path)
        
#         # Upload the file content from the request to Firebase Storage
#         blob.upload_from_file(file.file, content_type=file.content_type)
        
#         # If upload is successful, create the record in our database
#         db_material = crud.create_course_material(
#             db=db,
#             course_id=course_id,
#             title=title,
#             file_path=file_path,
#             content_type=file.content_type
#         )
#         return db_material
#     except Exception as e:
#         # If anything goes wrong, return a server error
#         raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to upload file: {e}")


# # ===================================================================
# # === STUDENT/INSTRUCTOR FEATURE: VIEW COURSE MATERIALS (NEW ENDPOINT) ===
# # ===================================================================
# @router.get(
#     "/{course_id}/materials",
#     response_model=List[schemas.CourseMaterialWithUrl],
#     summary="View all materials for a course"
# )
# def view_course_materials(
#     course_id: int,
#     db: Session = Depends(get_db),
#     # This dependency ensures only authorized users (admin, owner, or enrolled student) can view.
#     current_user: models.User = Depends(security.get_course_viewer)
# ):
#     """
#     View a list of materials for a course.
#     - **Requires Admin, Instructor (owner), or enrolled Student privileges.**
#     - Returns temporary, secure download URLs for each file.
#     """
#     db_materials = crud.get_materials_for_course(db, course_id=course_id)
    
#     response_materials = []
#     bucket = storage.bucket()
    
#     for material in db_materials:
#         blob = bucket.blob(material.file_path)
#         # Generate a temporary URL valid for 1 hour. This is a key security feature.
#         download_url = blob.generate_signed_url(version="v4", expiration=timedelta(hours=1))
        
#         # Combine the database data with the generated URL using our special schema
#         material_with_url = schemas.CourseMaterialWithUrl(
#             id=material.id,
#             title=material.title,
#             content_type=material.content_type,
#             created_at=material.created_at,
#             download_url=download_url
#         )
#         response_materials.append(material_with_url)
        
#     return response_materials

# @router.post("/{course_id}/enroll", status_code=status.HTTP_201_CREATED)
# def enroll_in_course(
#     course_id: int,
#     db: Session = Depends(get_db),
#     current_user: models.User = Depends(security.get_current_user)
# ):
#     """
#     Enroll the current authenticated user (student) in a course.
#     """
#     if current_user.role != models.UserRole.student:
#         raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only students can enroll in courses")
#     return crud.create_enrollment(db=db, course_id=course_id, user_id=current_user.id)

# @router.patch("/{course_id}/assign-instructor", response_model=schemas.Course)
# def assign_instructor(
#     course_id: int,
#     request: schemas.AssignInstructorRequest,
#     db: Session = Depends(get_db),
#     current_admin: models.User = Depends(security.get_current_admin_user)
# ):
#     """
#     Assign a new instructor to a course. **Requires Admin privileges.**
#     """
#     return crud.assign_instructor_to_course(
#         db=db, course_id=course_id, instructor_id=request.instructor_id
#     )

# # In app/routers/courses.py, before the "assign_instructor" endpoint

# @router.get("/{course_id}/students", response_model=List[schemas.Student])
# def view_enrolled_students(
#     course_id: int,
#     db: Session = Depends(get_db),
#     current_user: models.User = Depends(security.get_current_user)
# ):
#     """
#     View a list of students enrolled in a specific course.
#     - **Requires Admin or Instructor privileges.**
#     """
#     # We still check if the course exists to return a proper 404 error.
#     db_course = crud.get_course(db, course_id)
#     if db_course is None:
#         raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")

#     # --- MODIFIED PERMISSION CHECK ---
#     # Check if the user's role is one of the allowed roles.
#     allowed_roles = [models.UserRole.admin, models.UserRole.instructor]
#     if current_user.role not in allowed_roles:
#         raise HTTPException(
#             status_code=status.HTTP_403_FORBIDDEN,
#             detail="Only Admins and Instructors can view enrolled students."
#         )
#     students = crud.get_students_for_course(db, course_id=course_id)
#     return students