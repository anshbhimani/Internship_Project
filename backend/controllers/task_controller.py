from models.task_model import Task, TaskOut
from config.database import user_task_colection,tasks_collection,project_collection,status_collection
from controllers.project_module_controller import get_modules_by_project
from controllers.status_controller import get_all_status
from fastapi import HTTPException
from bson import ObjectId
from bson.errors import InvalidId

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
    except Exception:  # Using generic Exception as InvalidId might not be recognized
        raise HTTPException(status_code=400, detail="Invalid ObjectId format")

    tasks = await tasks_collection.find({"project_id": project_id}).to_list(None)
    
    # Convert _id and ensure all necessary fields are properly formatted
    formatted_tasks = []
    for task in tasks:
        task["_id"] = str(task["_id"])
        task["project_id"] = str(task["project_id"])  # Ensure project_id is also a string
        formatted_tasks.append(TaskOut(**task))
    return formatted_tasks

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
        # Step 1: Query user_tasks to get task_ids for the developer
        user_tasks_cursor = user_task_colection.find({"userId": developer_id})
        user_tasks = await user_tasks_cursor.to_list(length=None)

        if not user_tasks:
            raise HTTPException(status_code=404, detail="No tasks found for this developer.")

        # Extract task_ids from user_tasks
        task_ids = [str(user_task["taskId"]) for user_task in user_tasks]

        # Step 2: Query tasks collection to get tasks for the given task_ids
        tasks_cursor = tasks_collection.find({"_id": {"$in": [ObjectId(task_id) for task_id in task_ids]}})
        tasks = await tasks_cursor.to_list(length=None)

        if not tasks:
            raise HTTPException(status_code=404, detail="No tasks found for the given task IDs.")

        # Step 3: Filter tasks by project_id
        filtered_tasks = [
            {**task, "_id": str(task["_id"]), "project_id": str(task["project_id"]),
             "module_id": str(task["module_id"]), "status_id": str(task["status_id"])}
            for task in tasks if str(task["project_id"]) == project_id
        ]

        if not filtered_tasks:
            raise HTTPException(status_code=404, detail="No tasks found for this developer in the specified project.")

        # Step 4: Return the filtered tasks
        return filtered_tasks

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
