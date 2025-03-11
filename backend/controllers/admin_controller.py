from fastapi import HTTPException
from bson import ObjectId
from config.database import db
from typing import List

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


async def get_all_developers():
    developers_cursor = db["users"].find({"role": "developer"})
    developers = await developers_cursor.to_list(length=None)

    if not developers:
        raise HTTPException(status_code=404, detail="No developers found")

    # Convert ObjectId to string for JSON response
    for developer in developers:
        developer["_id"] = str(developer["_id"])
        if "manager_id" in developer:
            developer["manager_id"] = str(developer["manager_id"])

    return developers

async def assign_developers(project_id: str ,developers: List[str]):
    # Validate project existence
    project = await db["projects"].find_one({"_id": ObjectId(project_id)})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Validate project manager
    project_manager = await db["users"].find_one({"email": project["manager_email"], "role": "manager"})
    if not project_manager:
        raise HTTPException(status_code=404, detail="Project manager not found")
    
    # Convert developer IDs to ObjectId
    developer_ids = [ObjectId(dev) for dev in developers]

    # Fetch developers and validate their manager
    assigned_developers = await db["users"].find({"_id": {"$in": developer_ids}, "role": "developer"}).to_list(None)

    if len(assigned_developers) != len(developer_ids):
        raise HTTPException(status_code=400, detail="Some developers not found")

    # Append new developers to the project (avoid duplicates)
    updated_developers = list(set(project["developers"] + developer_ids))

    await db["projects"].update_one(
        {"_id": ObjectId(project_id)},
        {"$set": {"developers": updated_developers}}
    )

    return {"message": "Developers assigned successfully"}
