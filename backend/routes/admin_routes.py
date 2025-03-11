from fastapi import APIRouter
from controllers.admin_controller import assign_manager, deassign_manager,get_all_managers,get_all_developers,assign_developers
from pydantic import BaseModel
from typing import List

router = APIRouter(prefix="/admin", tags=["Admin"])
class AssignDevelopersRequest(BaseModel):
    developers: List[str]

# Route to assign manager to a developer
@router.put("/assign-manager/{developer_id}")
async def assign_manager_route(developer_id: str, manager_id: str):
    return await assign_manager(developer_id, manager_id)

# Route to deassign manager from a developer
@router.put("/deassign-manager/{developer_id}")
async def deassign_manager_route(developer_id: str):
    return await deassign_manager(developer_id)

# Route to get all managers
@router.get("/managers")
async def get_managers_route():
    return await get_all_managers()

# Route to get all managers 
@router.get("/developers")
async def get_developers_route():
    return await get_all_developers()

@router.put("/projects/{project_id}/assign-developers/{manager_id}")
async def assign_developers_to_project(project_id: str, request: AssignDevelopersRequest):
    return await assign_developers(project_id, request.developers)
