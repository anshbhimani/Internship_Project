from fastapi import APIRouter, Body
from controllers.project_controller import (
    create_project, get_all_projects, get_project, assign_manager_to_project,
    get_projects_by_manager, get_developers_by_manager, get_assigned_developers,
    get_developer_projects, delete_project
)
from models.project_model import Project
from typing import List

router = APIRouter(tags=["Projects"])

@router.post("/project/")
async def post_project(project: Project):
    return await create_project(project)

@router.get("/projects/")
async def get_all_projects_route():
    return await get_all_projects()

@router.get("/projects/{project_id}/")
async def get_project_route(project_id: str):
    return await get_project(project_id)

@router.get("/managers/{manager_id}/projects/")
async def get_projects_by_manager_route(manager_id: str):
    return await get_projects_by_manager(manager_id)

@router.get("/managers/{manager_id}/developers", response_model=List[dict])
async def get_developers_by_managers_route(manager_id: str):
    return await get_developers_by_manager(manager_id)

@router.get("/projects/{project_id}/developers")
async def get_project_developers(project_id: str):
    return await get_assigned_developers(project_id)

@router.get("/developer/{developer_id}", response_model=List)
async def fetch_projects_for_developer(developer_id: str):
    """API to fetch projects assigned to a developer"""
    return await get_developer_projects(developer_id)

@router.delete("/projects/{project_id}/")
async def delete_project_route(project_id: str):
    """API to delete a project along with related modules, teams, tasks, and user assignments."""
    return await delete_project(project_id)