from fastapi import APIRouter
from controllers.admin_controller import assign_manager, deassign_manager,get_all_managers

router = APIRouter(prefix="/admin", tags=["Admin"])

# Route to assign manager to a developer
@router.put("/admin/assign-manager/{developer_id}")
async def assign_manager_route(developer_id: str, manager_id: str):
    return await assign_manager(developer_id, manager_id)

# Route to deassign manager from a developer
@router.put("/admin/deassign-manager/{developer_id}")
async def deassign_manager_route(developer_id: str):
    return await deassign_manager(developer_id)

# Route to get all managers
@router.get("/admin/managers")
async def get_managers_route():
    return await get_all_managers()