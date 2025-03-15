from models.status_model import Status,StatusOut
from config.database import status_collection
from fastapi import HTTPException
from bson import ObjectId
from controllers.project_module_controller import get_modules_by_project

async def create_status(status:Status):
    status_data = status.dict()

    status_ = await status_collection.insert_one(status_data)
    status_data["_id"] = str(status_.inserted_id)
    
    return StatusOut(**status_data)

async def get_status(status_id: str):
    status = await status_collection.find_one({"_id": ObjectId(status_id)})
    if not status:
        raise HTTPException(status_code=404, detail="status not found")
    
    status["_id"] = str(status["_id"])  # Convert `_id` to string
    return StatusOut(**status)

async def get_all_status():
    statuses = await status_collection.find().to_list(None)  # Fetch all statuses
    for status in statuses:
        status["_id"] = str(status["_id"])
    return statuses

async def delete_status(status_id: str):
    result = await status_collection.delete_one({"_id": ObjectId(status_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="status not found")
    return {"message": "status deleted successfully"}

async def update_status(status_id: str, status: Status):
    try:
        status_id = ObjectId(status_id)
        existing_status = await status_collection.find_one({"_id": status_id})
    except Exception as e:
        raise HTTPException(status_code=500, detail="Database error: " + str(e))

    if not existing_status:
        raise HTTPException(status_code=404, detail="Status not found")
    
    status_data = status.dict(exclude_unset=True)  # Get only fields that have been updated

    # Update the status document, excluding _id
    status_data = {key: value for key, value in status_data.items() if key != "_id"}

    # Perform the update operation
    result = await status_collection.update_one(
        {"_id": status_id}, 
        {"$set": status_data}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Status not found")
    
    updated_status = await status_collection.find_one({"_id": status_id})
    updated_status["_id"] = str(updated_status["_id"])  # Ensure `_id` is in string format

    return updated_status

async def get_modules_and_statuses(project_id: str):
    try:
        # Fetch modules for the given project
        modules = await get_modules_by_project(project_id)

        # Fetch all statuses (or filter if you need specific statuses related to the project)
        statuses = await get_all_status()

        return {"modules": modules, "statuses": statuses}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching modules and statuses: {str(e)}")