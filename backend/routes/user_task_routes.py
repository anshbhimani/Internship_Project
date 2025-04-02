from fastapi import APIRouter, Depends
from controllers.user_task_controller import assign_task, get_user_tasks, remove_task_assignment, get_users_by_task
from models.user_task_model import UserTask

router = APIRouter(prefix="/user-tasks", tags=["User Tasks"])

# Assign a task to a user
@router.post("/assign")
async def assign_task_to_user(user_task: UserTask):
    return await assign_task(user_task)

# Get all tasks assigned to a specific user, including user details (like full name)
@router.get("/{user_id}")
async def fetch_user_tasks(user_id: str):
    tasks = await get_user_tasks(user_id)
    # You may want to format the tasks here if needed
    return tasks

@router.delete("/{user_id}/{task_id}")
async def deassign_task_from_user(user_id: str, task_id: str):
    return await remove_task_assignment(user_id, task_id)

# Get all users assigned to a specific task, including user details (like full name)
@router.get("/task/{task_id}")
async def get_users_for_task(task_id: str):
    return await get_users_by_task(task_id)
