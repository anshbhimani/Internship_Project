from fastapi import APIRouter, Depends
from controllers.user_task_controller import assign_task, get_user_tasks, remove_task_assignment
from models.user_task_model import UserTask

router = APIRouter(prefix="/user-tasks", tags=["User Tasks"])

# Assign a task to a user
@router.post("/assign")
async def assign_task_to_user(user_task: UserTask):
    return await assign_task(user_task)

# Get all tasks assigned to a specific user
@router.get("/{user_id}")
async def fetch_user_tasks(user_id: str):
    return await get_user_tasks(user_id)

# Remove a task assignment
@router.delete("/{user_task_id}")
async def delete_user_task(user_task_id: str):
    return await remove_task_assignment(user_task_id)
