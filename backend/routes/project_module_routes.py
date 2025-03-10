from fastapi import APIRouter, HTTPException, Depends
from typing import List
from bson import ObjectId
from config.database import db
from models.project_module_model import ProjectModule, ProjectModuleOut
from controllers.project_module_controller import create_project_module,get_project_module,update_project_module,delete_project_module

router = APIRouter(prefix="/modules", tags=["Modules"])


@router.post("/modules", response_model=ProjectModuleOut)
async def create_module(module: ProjectModule):
    return await create_project_module(module)

@router.get("/modules/{module_id}", response_model=ProjectModuleOut)
async def get_module(module_id: str):
    return await get_project_module(module_id)

@router.put("/modules/{module_id}", response_model=ProjectModuleOut)
async def update_module(module_id: str, updated_module: ProjectModule):
    return await update_project_module(module_id,updated_module)

@router.delete("/modules/{module_id}")
async def delete_module(module_id: str):
    return await delete_project_module(module_id)