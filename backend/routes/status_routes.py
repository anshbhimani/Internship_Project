# routes/status_routes.py
from fastapi import APIRouter,Body
from controllers.status_controller import create_status,get_all_status,get_status,delete_status,update_status
from models.status_model import Status,StatusOut
from typing import List
from pydantic import BaseModel


router = APIRouter(prefix="/status", tags=["Status"])

@router.post("/status", response_model=StatusOut)
async def createStatus(status: Status):
    return await create_status(status)

@router.get("/statuss/{status_id}", response_model=StatusOut)
async def getStatus(status_id: str):
    return await get_status(status_id)

@router.get("/statuss", response_model=List[StatusOut])
async def getAllStatus():
    return await get_all_status()

@router.put("/statuss/{status_id}", response_model=StatusOut)
async def updateStatus(status_id: str, updated_status: Status):
    return await update_status(status_id,updated_status)

@router.delete("/statuss/{status_id}")
async def deleteStatus(status_id: str):
    return await delete_status(status_id)