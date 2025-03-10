from fastapi import APIRouter, HTTPException, Depends
from typing import List
from bson import ObjectId
from config.database import db
from models.project_module_model import ProjectModule, ProjectModuleOut

router = APIRouter(prefix="/modules", tags=["Modules"])


@router.post("/modules", response_model=ProjectModuleOut)
async def create_module(module: ProjectModule):
    module_dict = module.dict()
    result = await db["project_modules"].insert_one(module_dict)
    module_dict["_id"] = str(result.inserted_id)
    return module_dict

@router.get("/modules", response_model=List[ProjectModuleOut])
async def get_all_modules():
    modules_cursor = db["project_modules"].find()
    modules = await modules_cursor.to_list(length=None)
    for module in modules:
        module["_id"] = str(module["_id"])
    return modules

@router.get("/modules/{module_id}", response_model=ProjectModuleOut)
async def get_module(module_id: str):
    module = await db["project_modules"].find_one({"_id": ObjectId(module_id)})
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")
    module["_id"] = str(module["_id"])
    return module

@router.put("/modules/{module_id}", response_model=ProjectModuleOut)
async def update_module(module_id: str, updated_module: ProjectModule):
    module_dict = updated_module.dict()
    result = await db["project_modules"].update_one({"_id": ObjectId(module_id)}, {"$set": module_dict})
    if result.modified_count == 0:
        raise HTTPException(status_code=400, detail="Failed to update module")
    module_dict["_id"] = module_id
    return module_dict

@router.delete("/modules/{module_id}")
async def delete_module(module_id: str):
    result = await db["project_modules"].delete_one({"_id": ObjectId(module_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Module not found")
    return {"message": "Module deleted successfully"}
