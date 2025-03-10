from models.task_model import Task, TaskOut
from config.database import user_task_colection,tasks_collection,project_collection
from fastapi import HTTPException
from bson import ObjectId

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
    project = await project_collection.find_one({"_id": task_data["project_id"]})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Insert task into DB
    result = await tasks_collection.insert_one(task_data)
    return {"message": "Task created successfully", "id": str(result.inserted_id)}

async def get_project_tasks(project_id: str):
    """Retrieve all tasks for a specific project"""
    try:
        project_id = ObjectId(project_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid ObjectId format")

    tasks_cursor = tasks_collection.find({"project_id": project_id})
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

    result = await tasks_collection.update_one({"_id": task_id}, {"$set": task_data})
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Task not found or no changes made")

    return {"message": "Task updated successfully"}

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


# async def taskId_to_userId(task_id: str):
#     result_cursor = await user_task_colection.find({"taskid": task_id})
#     result = await result_cursor.to_list(length=None)

#     if not result:
#         raise HTTPException(status_code=404, detail="User for task not found")

#     return result  

async def get_tasks_for_developer(developer_id: str, project_id: str):
    """Retrieve tasks for a developer in a specific project"""
    try:
        # Query user_tasks to find all tasks assigned to the developer
        tasks_cursor = tasks_collection.find({"project_id": ObjectId(project_id)})
        tasks = await tasks_cursor.to_list(length=None)

        if not tasks:
            raise HTTPException(status_code=404, detail="No tasks found for this project.")

        # List to hold valid tasks for the developer
        valid_tasks = []

        for task in tasks:
                task_id = str(task["_id"])  # Task ID
                task_name = task["title"]  # Task Name

                # Query the user_task_colection to find if this task is assigned to the developer
                user_task_cursor = user_task_colection.find({"taskid": task_id, "userId": developer_id})
                user_task = await user_task_cursor.to_list(length=1)

                if user_task:
                    # If the developer is assigned to this task, add the task to the valid tasks list
                    task["_id"] = str(task["_id"])
                    task["project_id"] = str(task["project_id"])
                    task["module_id"] = str(task["module_id"])
                    task["status_id"] = str(task["status_id"])
                    valid_tasks.append(task)

        if not valid_tasks:
            raise HTTPException(status_code=404, detail="No tasks found for this developer.")

        return valid_tasks

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")