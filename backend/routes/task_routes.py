from fastapi import APIRouter, Depends
from controllers.task_controller import create_task, get_project_tasks, update_task, delete_task,get_tasks_for_developer,update_task_status,get_task_status
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

@router.get("/developer/{developer_id}/{project_id}")
async def get_tasks_for_developer_route(developer_id: str, project_id: str):
    """API to fetch tasks assigned to a specific developer for a project"""
    return await get_tasks_for_developer(developer_id, project_id)

@router.get("/{task_id}/status")
async def get_task_status_route(task_id: str):
    """Get the status of a task"""
    return await get_task_status(task_id)

@router.put("/{task_id}/status/{status_id}")
async def update_task_status_route(task_id: str, status_id: str):
    """Update the status of a task"""
    return await update_task_status(task_id, status_id)
