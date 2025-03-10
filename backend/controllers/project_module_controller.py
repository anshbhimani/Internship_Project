from fastapi import HTTPException
from bson import ObjectId
from config.database import project_modules_collection,status_collection
from models.project_module_model import ProjectModule, ProjectModuleOut
from models.status_model import StatusOut

async def create_project_module(module: ProjectModule):
    module_dict = module.dict()
    result = await project_modules_collection.insert_one(module_dict)
    if not result.inserted_id:
        raise HTTPException(status_code=500, detail="Failed to create module")
    module_dict["_id"] = str(result.inserted_id)
    return module_dict

async def get_project_module(module_id: str):
    module = await project_modules_collection.find_one({"_id": ObjectId(module_id)})
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")
    module["_id"] = str(module["_id"])
    return module


async def update_project_module(module_id: str, module: ProjectModule):
    module_dict = module.dict()
    result = await project_modules_collection.update_one(
        {"_id": ObjectId(module_id)},
        {"$set": module_dict}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=400, detail="Failed to update module")
    return {"_id": module_id, **module_dict}

async def delete_project_module(module_id: str):
    result = await project_modules_collection.delete_one({"_id": ObjectId(module_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Module not found")
    return {"message": "Module deleted successfully"}


# New function to fetch project modules and statuses
async def get_project_modules_and_statuses(project_id: str):
    # Query the modules from the database using the project_id
    project_modules_cursor = project_modules_collection.find({"projectId": project_id})
    modules = await project_modules_cursor.to_list(length=None)
    
    # Query statuses
    statuses_cursor =status_collection.find({})
    statuses = await statuses_cursor.to_list(length=None)
    
    # Map results to Pydantic models
    modules_out = [ProjectModuleOut(**module) for module in modules]
    statuses_out = [StatusOut(**status) for status in statuses]
    
    return modules_out, statuses_out
