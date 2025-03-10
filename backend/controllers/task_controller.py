from models.task_model import Task, TaskOut
from config.database import db
from fastapi import HTTPException
from bson import ObjectId
from typing import List, Optional

async def create_task(task: Task):
    """Create a new task"""
    task_data = task.dict()
    
    # Convert string IDs to ObjectId
    try:
        task_data["module_id"] = ObjectId(task_data["module_id"])
        task_data["project_id"] = ObjectId(task_data["project_id"])
        task_data["status_id"] = ObjectId(task_data["status_id"])
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid ObjectId format")
    
    # Validate project
    project = await db["projects"].find_one({"_id": task_data["project_id"]})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Insert task into DB
    result = await db["tasks"].insert_one(task_data)
    return {"message": "Task created successfully", "id": str(result.inserted_id)}

async def get_project_tasks(project_id: str):
    """Retrieve all tasks for a specific project"""
    try:
        project_id = ObjectId(project_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid ObjectId format")

    tasks_cursor = db["tasks"].find({"project_id": project_id})
    tasks = await tasks_cursor.to_list(length=None)

    for task in tasks:
        task["_id"] = str(task["_id"])
        task["project_id"] = str(task["project_id"])
        task["module_id"] = str(task["module_id"])
        task["status_id"] = str(task["status_id"])

    return tasks

async def update_task(task_id: str, updated_task: Task):
    """Update an existing task"""
    try:
        task_id = ObjectId(task_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid ObjectId format")

    task_data = updated_task.dict(exclude_unset=True)

    if "module_id" in task_data:
        task_data["module_id"] = ObjectId(task_data["module_id"])
    if "project_id" in task_data:
        task_data["project_id"] = ObjectId(task_data["project_id"])
    if "status_id" in task_data:
        task_data["status_id"] = ObjectId(task_data["status_id"])

    result = await db["tasks"].update_one({"_id": task_id}, {"$set": task_data})
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Task not found or no changes made")

    return {"message": "Task updated successfully"}

async def delete_task(task_id: str):
    """Delete a task"""
    try:
        task_id = ObjectId(task_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid ObjectId format")

    result = await db["tasks"].delete_one({"_id": task_id})

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Task not found")

    return {"message": "Task deleted successfully"}
