from models.task_model import Task, TaskOut
from config.database import user_task_collection,tasks_collection,project_collection,status_collection
from controllers.project_module_controller import get_modules_by_project
from controllers.status_controller import get_all_status
from fastapi import HTTPException,UploadFile,File,Form
from utils.CloudinaryUtil import upload_image
from typing import Optional
from bson import ObjectId
import os
import shutil


UPLOAD_DIR = "../UPLOADS"

async def create_task(
    title: str = Form(...),
    priority: str = Form(...),
    description: str = Form(...),
    totalMinutes: int = Form(...),
    module_id: str = Form(...),
    project_id: str = Form(...),
    status_id: str = Form(...),
    image: Optional[UploadFile] = File(None)
):
    """Create a new task"""
    if not ObjectId.is_valid(module_id) or not ObjectId.is_valid(project_id) or not ObjectId.is_valid(status_id):
        raise HTTPException(status_code=400, detail="Invalid ObjectId format")
    
    project = await project_collection.find_one({"_id": ObjectId(project_id)})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    task_data = {
        "title": title,
        "priority": priority,
        "description": description,
        "totalMinutes": totalMinutes,
        "module_id": ObjectId(module_id),
        "project_id": ObjectId(project_id),
        "status_id": ObjectId(status_id),
        "ui_image_url": None
    }
    
    if image:
        try:
            file_ext = image.filename.split(".")[-1]
            file_path = os.path.join(UPLOAD_DIR, f"{ObjectId()}.{file_ext}")
            # Ensure the directory exists
            os.makedirs(UPLOAD_DIR, exist_ok=True)
        
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(image.file, buffer)
            
            if not file_ext.lower() in ["jpg", "jpeg", "png"]:
             raise HTTPException(status_code=400, detail="Invalid image format")
            
            task_data["ui_image_url"] = await upload_image(file_path)

            os.remove(file_path)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Image upload failed: {str(e)}")
    
    result = await tasks_collection.insert_one(task_data)
    return {"message": "Task created successfully", "id": str(result.inserted_id), "image_url": task_data["ui_image_url"]}

async def get_project_tasks(project_id: str):
    """Retrieve all tasks for a specific project"""
    try:
        project_id = ObjectId(project_id)
    except Exception:  # Using generic Exception as InvalidId might not be recognized
        raise HTTPException(status_code=400, detail="Invalid ObjectId format")

    tasks = await tasks_collection.find({"project_id": project_id}).to_list(None)
    
    # Convert _id and ensure all necessary fields are properly formatted
    return [
    TaskOut(
        **{
            **{k: v for k, v in task.items() if k != "image"},
            "_id": str(task["_id"]),
            "project_id": str(task.get("project_id", "")),
            "image_url": task.get("ui_image_url", None)
        }
    )
    for task in tasks
]

async def update_task(task_id: str, updated_task: Task = None, 
                     title: str = Form(None),
                     priority: str = Form(None),
                     description: str = Form(None), 
                     totalMinutes: int = Form(None),
                     module_id: str = Form(None),
                     project_id: str = Form(None),
                     status_id: str = Form(None),
                     image: Optional[UploadFile] = File(None)):
    """Update an existing task - supports both JSON and form data"""
    try:
        task_id = ObjectId(task_id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid task_id format: {str(e)}")
    
    # Check if the task exists
    existing_task = await tasks_collection.find_one({"_id": task_id})
    if not existing_task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Initialize task_data dictionary
    task_data = {}
    
    # Handle JSON request
    if updated_task:
        try:
            # Print request data for debugging
            print(f"Received update data: {updated_task.dict()}")
            
            task_data = updated_task.dict(exclude_unset=True, exclude={"id", "image"})
            
            # Convert string IDs to ObjectId
            if "module_id" in task_data and task_data["module_id"]:
                task_data["module_id"] = ObjectId(task_data["module_id"])
            if "project_id" in task_data and task_data["project_id"]:
                task_data["project_id"] = ObjectId(task_data["project_id"])
            if "status_id" in task_data and task_data["status_id"]:
                task_data["status_id"] = ObjectId(task_data["status_id"])
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Error processing JSON data: {str(e)}")
    
    # Handle form data request
    else:
        try:
            if title is not None:
                task_data["title"] = title
            if priority is not None:
                task_data["priority"] = priority
            if description is not None:
                task_data["description"] = description
            if totalMinutes is not None:
                task_data["totalMinutes"] = totalMinutes
            if module_id is not None:
                task_data["module_id"] = ObjectId(module_id)
            if project_id is not None:
                task_data["project_id"] = ObjectId(project_id) 
            if status_id is not None:
                task_data["status_id"] = ObjectId(status_id)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Error processing form data: {str(e)}")
    
    # Handle image upload in either case
    if image:
        try:
            file_ext = image.filename.split(".")[-1]
            file_path = os.path.join(UPLOAD_DIR, f"{ObjectId()}.{file_ext}")
            os.makedirs(UPLOAD_DIR, exist_ok=True)
        
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(image.file, buffer)
            
            if not file_ext.lower() in ["jpg", "jpeg", "png"]:
                raise HTTPException(status_code=400, detail="Invalid image format")
            
            task_data["ui_image_url"] = await upload_image(file_path)
            
            os.remove(file_path)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Image upload failed: {str(e)}")
    
    # Only update if there's data to update
    if not task_data:
        return {"message": "No changes to update"}

    try:
        result = await tasks_collection.update_one({"_id": task_id}, {"$set": task_data})
        
        if result.modified_count == 0:
            # This might happen if the data is the same as existing
            return {"message": "No changes made to task"}

        return {"message": "Task updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database update error: {str(e)}")
    
async def delete_task(task_id: str):
    """Delete a task"""
    try:
        task_id = ObjectId(task_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid ObjectId format")

    result = await tasks_collection.delete_one({"_id": task_id})

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Task not found")

    return {"message": "Task deleted successfully"}

 
async def get_modules_and_statuses(project_id: str):
    try:
        # Fetch modules for the given project
        modules = await get_modules_by_project(project_id)

        # Fetch all statuses (or filter if you need specific statuses related to the project)
        statuses = await get_all_status()

        return {"modules": modules, "statuses": statuses}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching modules and statuses: {str(e)}")

async def get_tasks_for_developer(developer_id: str, project_id: str):
    """Retrieve tasks for a developer in a specific project"""
    try:
        user_tasks_cursor = user_task_collection.find({"userId": developer_id})
        user_tasks = await user_tasks_cursor.to_list(length=None)

        if not user_tasks:
            raise HTTPException(status_code=404, detail="No tasks found for this developer.")

        # Extract task_ids and convert to ObjectId
        task_ids = [ObjectId(user_task["taskId"]) for user_task in user_tasks if ObjectId.is_valid(user_task["taskId"])]

        if not task_ids:
            raise HTTPException(status_code=404, detail="No valid task IDs found.")

        tasks_cursor = tasks_collection.find({"_id": {"$in": task_ids}})
        tasks = await tasks_cursor.to_list(length=None)

        if not tasks:
            raise HTTPException(status_code=404, detail="No tasks found for the given task IDs.")

        # Convert ObjectId to strings
        filtered_tasks = []
        for task in tasks:
            task["_id"] = str(task["_id"])
            task["project_id"] = str(task["project_id"])
            task["module_id"] = str(task["module_id"]) if "module_id" in task else None
            task["status_id"] = str(task["status_id"]) if "status_id" in task else None
            filtered_tasks.append(task)

        if not filtered_tasks:
            raise HTTPException(status_code=404, detail="No tasks found for this developer in the specified project.")

        return filtered_tasks
    
    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

async def get_task_status(task_id: str):
    """Retrieve the status of a task"""
    task = await tasks_collection.find_one({"_id": ObjectId(task_id)})
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    status = await status_collection.find_one({"_id": ObjectId(task["status_id"])})
    if not status:
        raise HTTPException(status_code=404, detail="Status not found")

    return {"status_id": str(status["_id"]), "status_name": status["statusName"]}

async def update_task_status(task_id: str, status_id: str):
    """Update the status of a task"""
    task = await tasks_collection.find_one({"_id": ObjectId(task_id)})
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    status = await status_collection.find_one({"_id": ObjectId(status_id)})
    if not status:
        raise HTTPException(status_code=404, detail="Status not found")

    result = await tasks_collection.update_one(
        {"_id": ObjectId(task_id)}, {"$set": {"status_id": ObjectId(status_id)}}
    )

    if result.modified_count == 0:
        raise HTTPException(status_code=400, detail="Failed to update task status")

    return {"message": "Task status updated successfully", "task_id": task_id, "status_id": status_id}
