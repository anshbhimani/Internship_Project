from fastapi import HTTPException
from bson import ObjectId
from config.database import db
from models.user_task_model import UserTask, UserTaskOut

# Assign a task to a user
async def assign_task(user_task: UserTask):
    # Ensure user exists
    user = await db["users"].find_one({"_id": ObjectId(user_task.userId)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Ensure task exists
    task = await db["tasks"].find_one({"_id": ObjectId(user_task.taskId)})
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    # Insert into user_tasks collection
    result = await db["user_tasks"].insert_one(user_task.dict())
    return {"message": "Task assigned successfully", "user_task_id": str(result.inserted_id)}

# Get all tasks assigned to a user
async def get_user_tasks(user_id: str):
    tasks_cursor = db["user_tasks"].find({"userId": user_id})
    tasks = await tasks_cursor.to_list(length=None)

    if not tasks:
        raise HTTPException(status_code=404, detail="No tasks found for this user")

    for task in tasks:
        task["_id"] = str(task["_id"])

    return tasks

# Remove a task assignment
async def remove_task_assignment(user_task_id: str):
    result = await db["user_tasks"].delete_one({"_id": ObjectId(user_task_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Task assignment not found")

    return {"message": "Task assignment removed successfully"}
