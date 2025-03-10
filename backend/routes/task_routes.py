from fastapi import APIRouter, Depends
from controllers.task_controller import create_task, get_project_tasks, update_task, delete_task
from typing import List
from models.task_model import Task
router = APIRouter(prefix="/tasks", tags=["Tasks"])

@router.post("/", response_model=dict)
async def create_new_task(task: Task):
    """API to create a new task"""
    return await create_task(task)

@router.get("/{project_id}", response_model=List[dict])
async def fetch_project_tasks(project_id: str):
    """API to fetch tasks for a specific project"""
    return await get_project_tasks(project_id)

@router.put("/{task_id}", response_model=dict)
async def modify_task(task_id: str, updated_task: Task):
    """API to update a task"""
    return await update_task(task_id, updated_task)

@router.delete("/{task_id}", response_model=dict)
async def remove_task(task_id: str):
    """API to delete a task"""
    return await delete_task(task_id)

# @router.get("/{task_id}", response_model=List[dict])
# async def fetch_task_user(task_id: str):
#     """API to user for a specific task"""
#     return await taskId_to_userId(task_id)
