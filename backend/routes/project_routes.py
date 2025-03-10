# routes/project_routes.py
from fastapi import APIRouter,Body
from controllers.project_controller import create_project, get_all_projects,assign_developers,get_project,assign_manager_to_project,get_projects_by_manager,get_developers_by_manager,get_assigned_developers,remove_developer
from models.project_model import Project
from typing import List
from pydantic import BaseModel

class AssignDevelopersRequest(BaseModel):
    developers: List[str]


router = APIRouter()

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

@router.put("/projects/{project_id}/assign-manager/{manager_id}")
async def assign_manager(project_id: str, manager_id: str,developers: List[str] = Body(...)):
    return await assign_manager_to_project(project_id, manager_id)

@router.get("/managers/{manager_id}/developers", response_model=List[dict])
async def get_developers_by_managers_route(manager_id: str):
    return await get_developers_by_manager(manager_id)

@router.put("/projects/{project_id}/assign-developers/{manager_id}")
async def assign_developers_to_project(project_id: str, manager_id: str, request: AssignDevelopersRequest):
    return await assign_developers(project_id, manager_id, request.developers)

@router.get("/projects/{project_id}/developers")
async def get_project_developers(project_id: str):
    return await get_assigned_developers(project_id)

@router.delete("/projects/{project_id}/remove-developer/{developer_id}")
async def remove_developer_from_project(project_id: str, developer_id: str):
    return await remove_developer(project_id, developer_id)

