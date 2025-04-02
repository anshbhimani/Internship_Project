# routes/status_routes.py
from fastapi import APIRouter,Body
from controllers.status_controller import create_status,get_all_status,get_status,delete_status,update_status,get_modules_and_statuses
from models.status_model import Status,StatusOut
from typing import List


router = APIRouter(prefix="/status", tags=["Status"])

@router.post("/status", response_model=StatusOut)
async def createStatus(status: Status):
    return await create_status(status)

@router.get("/status/{status_id}", response_model=StatusOut)
async def getStatus(status_id: str):
    return await get_status(status_id)

@router.get("/status", response_model=List[StatusOut])
async def getAllStatus():
    return await get_all_status()

@router.get("/{project_id}/modules-statuses", response_model=dict)
async def get_modules_and_statuses_route(project_id:str):
    return await get_modules_and_statuses(project_id)

@router.put("/status/{status_id}", response_model=StatusOut)
async def updateStatus(status_id: str, updated_status: Status):
    return await update_status(status_id,updated_status)

@router.delete("/status/{status_id}")
async def deleteStatus(status_id: str):
    return await delete_status(status_id)

