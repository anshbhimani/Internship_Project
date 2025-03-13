from fastapi import HTTPException
from bson import ObjectId
from config.database import db
from models.user_task_model import UserTask
from controllers.email import send_task_assignment_email, send_task_removal_email

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

    # Send Email Notification
    await send_task_assignment_email(user, task)

    return {"message": "Task assigned successfully", "user_task_id": str(result.inserted_id)}

# Get all tasks assigned to a user
async def get_user_tasks(user_id: str):
    tasks_cursor = db["user_tasks"].find({"userId": user_id})
    tasks = await tasks_cursor.to_list(length=None)

    if not tasks:
        raise HTTPException(status_code=404, detail="No tasks found for this user")

    for task in tasks:
        task["_id"] = str(task["_id"])

        # Fetch user details for assigned user
        user = await db["users"].find_one({"_id": ObjectId(task["userId"])})
        if user:
            task["assignedTo"] = f"{user.get('firstname', '')} {user.get('lastname', '')}"

    return tasks

# Get all users assigned to a specific task
async def get_users_by_task(task_id: str):
    # Query the user_tasks collection to get users assigned to the task
    user_tasks_cursor = db["user_tasks"].find({"taskId": task_id})
    user_tasks = await user_tasks_cursor.to_list(length=None)

    if not user_tasks:
        raise HTTPException(status_code=404, detail="No users found for this task")

    users = []
    for user_task in user_tasks:
        user = await db["users"].find_one({"_id": ObjectId(user_task["userId"])})
        if user:
            users.append({
                "user_id": str(user["_id"]),
                "firstname": user.get("firstname"),
                "lastname": user.get("lastname"),
                "full_name": f"{user.get('firstname', '')} {user.get('lastname', '')}"
            })

    if not users:
        raise HTTPException(status_code=404, detail="No users found for this task")

    return users

# Remove a task assignment for a specific user
async def remove_task_assignment(user_id: str, task_id: str):
    # Ensure user exists
    user = await db["users"].find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Ensure task exists
    task = await db["tasks"].find_one({"_id": ObjectId(task_id)})
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    result = await db["user_tasks"].delete_one({"userId": user_id, "taskId": task_id})

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Task assignment not found")

    # Send Email Notification
    await send_task_removal_email(user, task)

    return {"message": "Task assignment removed successfully"}
