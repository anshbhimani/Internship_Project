from fastapi import HTTPException
from bson import ObjectId
from config.database import project_modules_collection,project_collection
from models.project_module_model import ProjectModule,ProjectModuleOut
from typing import List

async def create_project_module(module: ProjectModule):
    module_dict = module.dict()
    module_dict['projectId'] = ObjectId(module_dict['projectId'])

    # Fetch project name using projectId
    project = await project_collection.find_one({"_id": module_dict["projectId"]})
    module_dict["project_name"] = project["title"] if project else "Unknown"

    result = await project_modules_collection.insert_one(module_dict)
    if not result.inserted_id:
        raise HTTPException(status_code=500, detail="Failed to create module")
    
    module_dict["_id"] = str(result.inserted_id)
    module_dict["projectId"] = str(module_dict["projectId"])

    return module_dict

async def get_project_module(module_id: str):
    module = await project_modules_collection.find_one({"_id": ObjectId(module_id)})
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")

    # Fetch project name using projectId
    if "projectId" in module:
        project = await project_collection.find_one({"_id": module["projectId"]})
        module["project_name"] = project["title"] if project else "Unknown"

    # Convert ObjectId fields to string before returning
    module["_id"] = str(module["_id"])
    module["projectId"] = str(module["projectId"])

    return module

async def update_project_module(module_id: str, module: ProjectModule):
    try:
        module_dict = module.dict()

        # Convert fields to ObjectId
        if "projectId" in module_dict:
            module_dict["projectId"] = ObjectId(module_dict["projectId"])

        if "status" in module_dict:
            module_dict["status"] = ObjectId(module_dict["status"])

        # Check if the module exists before updating
        existing_module = await project_modules_collection.find_one({"_id": ObjectId(module_id)})
        if not existing_module:
            raise HTTPException(status_code=404, detail="Module not found")

        # Fetch project name using projectId
        project = await project_collection.find_one({"_id": module_dict["projectId"]})
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        module_dict["project_name"] = project["title"]  # Assuming the project name is stored as "title"

        # Update the module
        result = await project_modules_collection.update_one(
            {"_id": ObjectId(module_id)},
            {"$set": module_dict}
        )

        if result.modified_count == 0:
            raise HTTPException(status_code=400, detail="No changes were made to the module")

        # Convert ObjectId fields back to string before returning
        module_dict["_id"] = str(module_id)
        module_dict["projectId"] = str(module_dict["projectId"])
        module_dict["status"] = str(module_dict["status"])

        return module_dict

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

async def delete_project_module(module_id: str):
    result = await project_modules_collection.delete_one({"_id": ObjectId(module_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Module not found")
    return {"message": "Module deleted successfully"}

async def get_modules_by_project(project_id: str) -> List[ProjectModuleOut]:
    # Fetch project to get project name
    project = await project_collection.find_one({"_id": ObjectId(project_id)})
    project_name = project["title"] if project else "Unknown"

    # Fetch modules belonging to the project
    modules = await project_modules_collection.find({"projectId": ObjectId(project_id)}).to_list(None)

    # Convert ObjectId fields and include project name
    for module in modules:
        module["_id"] = str(module["_id"])
        module["projectId"] = str(module["projectId"])
        module["status"] = str(module["status"]) if "status" in module else None
        module["project_name"] = project_name  # Add project name to each module

    return [ProjectModuleOut(**module) for module in modules]