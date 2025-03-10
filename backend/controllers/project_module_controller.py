from fastapi import APIRouter, HTTPException, Depends
from bson import ObjectId
from config.database import db
from models.project_module_model import ProjectModule, ProjectModuleOut

router = APIRouter()

# Create a new project module
@router.post("/modules", response_model=ProjectModuleOut)
async def create_project_module(module: ProjectModule):
    module_dict = module.dict()
    result = await db["project_modules"].insert_one(module_dict)
    if not result.inserted_id:
        raise HTTPException(status_code=500, detail="Failed to create module")
    module_dict["_id"] = str(result.inserted_id)
    return module_dict

# Get all project modules
@router.get("/modules", response_model=list[ProjectModuleOut])
async def get_all_modules():
    modules_cursor = db["project_modules"].find()
    modules = await modules_cursor.to_list(length=None)
    for module in modules:
        module["_id"] = str(module["_id"])
    return modules

# Get a specific project module by ID
@router.get("/modules/{module_id}", response_model=ProjectModuleOut)
async def get_module(module_id: str):
    module = await db["project_modules"].find_one({"_id": ObjectId(module_id)})
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")
    module["_id"] = str(module["_id"])
    return module

# Update a project module
@router.put("/modules/{module_id}", response_model=ProjectModuleOut)
async def update_module(module_id: str, module: ProjectModule):
    module_dict = module.dict()
    result = await db["project_modules"].update_one(
        {"_id": ObjectId(module_id)},
        {"$set": module_dict}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=400, detail="Failed to update module")
    return {"_id": module_id, **module_dict}

# Delete a project module
@router.delete("/modules/{module_id}")
async def delete_module(module_id: str):
    result = await db["project_modules"].delete_one({"_id": ObjectId(module_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Module not found")
    return {"message": "Module deleted successfully"}
