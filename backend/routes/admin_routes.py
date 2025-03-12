from fastapi import APIRouter, Depends
from controllers.admin_controller import (
    get_all_developers,
    get_all_managers,
    assign_manager_to_project,
    deassign_manager_from_project,
    assign_developers_to_project,
    deassign_developers_from_project
)
from pydantic import BaseModel
from typing import List

router = APIRouter(prefix="/admin", tags=["Admin"])

class AssignDevelopersRequest(BaseModel):
    developers: List[str]

# Route to assign manager to a project
@router.put("/assign-manager/{project_id}/{manager_id}")
async def assign_manager_to_project_route(project_id: str, manager_id: str):
    return await assign_manager_to_project(project_id, manager_id)

# Route to deassign manager from a project
@router.delete("/deassign-manager/{project_id}/{manager_id}")
async def deassign_manager_from_project_route(project_id: str, manager_id: str):
    return await deassign_manager_from_project(project_id, manager_id)

# Route to get all managers
@router.get("/managers")
async def get_managers_route():
    return await get_all_managers()

# Route to get all developers
@router.get("/developers")
async def get_developers_route():
    return await get_all_developers()

# Route to assign developers to a project
@router.put("/projects/{project_id}/assign-developers/{developer_id}")
async def assign_developers_to_project_route(project_id: str, developer_id: str):
    return await assign_developers_to_project(project_id, developer_id)

# Route to deassign developers from a project
@router.delete("/projects/{project_id}/deassign-developers/{developer_id}")
async def deassign_developers_from_project_route(project_id: str, developer_id: str):
    return await deassign_developers_from_project(project_id, developer_id)
