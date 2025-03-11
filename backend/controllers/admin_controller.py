from fastapi import HTTPException
from bson import ObjectId
from config.database import db

# Function to assign manager to developer
async def assign_manager(developer_id: str, manager_id: str):
    # Validate that the developer exists
    developer = await db["users"].find_one({"_id": ObjectId(developer_id), "role": "developer"})
    if not developer:
        raise HTTPException(status_code=404, detail="Developer not found")

    # Validate that the manager exists
    manager = await db["users"].find_one({"_id": ObjectId(manager_id), "role": "manager"})
    if not manager:
        raise HTTPException(status_code=404, detail="Manager not found")

    # Update the developer's manager_id field
    result = await db["users"].update_one(
        {"_id": ObjectId(developer_id)},
        {"$set": {"manager_id": ObjectId(manager_id)}}
    )

    if result.modified_count == 0:
        raise HTTPException(status_code=400, detail="Failed to assign manager")
    
    return {"message": f"Manager {manager_id} successfully assigned to Developer {developer_id}"}

# Function to deassign manager from developer
async def deassign_manager(developer_id: str):
    # Validate that the developer exists
    developer = await db["users"].find_one({"_id": ObjectId(developer_id), "role": "developer"})
    if not developer:
        raise HTTPException(status_code=404, detail="Developer not found")

    # Remove the manager_id field
    result = await db["users"].update_one(
        {"_id": ObjectId(developer_id)},
        {"$unset": {"manager_id": ""}}
    )

    if result.modified_count == 0:
        raise HTTPException(status_code=400, detail="Failed to deassign manager")

    return {"message": f"Manager deassigned from Developer {developer_id}"}

async def get_all_managers():
    managers_cursor = db["users"].find({"role": "manager"})
    managers = await managers_cursor.to_list(length=None)

    if not managers:
        raise HTTPException(status_code=404, detail="No managers found")

    # Convert ObjectId to string for JSON response
    for manager in managers:
        manager["_id"] = str(manager["_id"])

    return managers