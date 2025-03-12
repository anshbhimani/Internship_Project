from fastapi import HTTPException
from bson import ObjectId
from config.database import project_team_collection,user_collection,project_collection
from typing import List,Optional

# Function to assign manager to project
async def assign_manager_to_project(project_id: str, manager_id: str):
    # Validate that the project exists
    project = await project_collection.find_one({"_id": ObjectId(project_id)})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Validate that the manager exists
    manager = await user_collection.find_one({"_id": ObjectId(manager_id), "role": "manager"})
    if not manager:
        raise HTTPException(status_code=404, detail="Manager not found")

    # Update the project's manager_id field
    result = await project_collection.update_one(
        {"_id": ObjectId(project_id)},
        {"$set": {"manager_id": ObjectId(manager_id)}}
    )

    if result.modified_count == 0:
        raise HTTPException(status_code=400, detail="Failed to assign manager")
    
    result = await project_team_collection.update_one(
        {"projectId": ObjectId(project_id)},
        {"$set": {"manager_id": ObjectId(manager_id)}}
    )

    if result.modified_count == 0:
        raise HTTPException(status_code=400, detail="Failed to assign manager")
    
    return {"message": f"Manager {manager_id} successfully assigned to Project {project_id}"}

# Function to deassign manager from a project
async def deassign_manager_from_project(project_id: str,manager_id:str):
    if not ObjectId.is_valid(project_id) or not ObjectId.is_valid(manager_id):
        raise HTTPException(status_code=400, detail="Invalid project ID format")

    project = await project_collection.find_one({"_id": ObjectId(project_id)})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    if "manager_id" not in project or not project["manager_id"]:
        raise HTTPException(status_code=400, detail="No manager assigned to this project")

    if str(project["manager_id"]) != manager_id:
        raise HTTPException(status_code=403, detail="Provided manager ID does not match the assigned manager")

    # Remove the manager by setting it to None
    result = await project_collection.update_one(
        {"_id": ObjectId(project_id)},
        {"$unset": {"manager_id": ""}}
    )

    if result.modified_count == 0:
        raise HTTPException(status_code=400, detail="Failed to deassign manager")

    return {"message": f"Manager {manager_id} removed from Project {str(project_id)}"}

async def get_all_managers():
    managers_cursor = user_collection.find({"role": "manager"})
    managers = await managers_cursor.to_list(length=None)

    if not managers:
        raise HTTPException(status_code=404, detail="No managers found")

    # Convert ObjectId to string for JSON response
    for manager in managers:
        manager["_id"] = str(manager["_id"])

    return [{**manager, "_id": str(manager["_id"])} for manager in managers]

async def get_all_developers():
    developers_cursor = user_collection.find({"role": "developer"})
    developers = await developers_cursor.to_list(length=None)

    if not developers:
        raise HTTPException(status_code=404, detail="No developers found")

    # Convert ObjectId to string for JSON response
    for developer in developers:
        developer["_id"] = str(developer["_id"])
        if "manager_id" in developer:
            developer["manager_id"] = str(developer["manager_id"])

    return developers

async def assign_developers_to_project(project_id: str ,developers: List[str]):
    if not ObjectId.is_valid(project_id):
        raise HTTPException(status_code=400, detail="Invalid ID format")
    
    # Validate project existence
    project = await project_collection.find_one({"_id": ObjectId(project_id)})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Convert developer IDs to ObjectId
    developer_ids = [ObjectId(dev) for dev in developers if ObjectId.is_valid(dev)]

    # Fetch developers and validate their role
    assigned_developers = await user_collection.find({"_id": {"$in": developer_ids}, "role": "developer"}).to_list(None)

    if len(assigned_developers) != len(developer_ids):
        raise HTTPException(status_code=400, detail="Some developers not found or not a developer role")

    project_team = await project_team_collection.find_one({"projectId": ObjectId(project_id)})
    existing_developers = project_team.get("developers", []) if project_team else []
    existing_developers = [ObjectId(dev) if isinstance(dev, str) else dev for dev in existing_developers]
    updated_developers = list(set(existing_developers + developers))
    
    if project_team:
        await project_team_collection.update_one(
            {"projectId": ObjectId(project_id)},
            {"$set": {"developers": updated_developers}}
        )
    else:
        await project_team_collection.insert_one({"projectId": ObjectId(project_id), "developers": developers})

    return {"message": "Developers assigned successfully"}

# Function to deassign developers from a project
async def deassign_developers_from_project(project_id: str, developer_ids: Optional[List[str]] = None):
    if not ObjectId.is_valid(project_id):
        raise HTTPException(status_code=400, detail="Invalid project ID format")

    project_team = await project_team_collection.find_one({"projectId": project_id})
    if not project_team:
        raise HTTPException(status_code=404, detail="Project team not found")

    current_developers = project_team.get("developers", [])

    if not current_developers:
        raise HTTPException(status_code=400, detail="No developers assigned to this project")

    current_developers = [ObjectId(dev) if isinstance(dev, str) else dev for dev in current_developers]
    if developer_ids:
       # Remove only specified developers
        developer_ids = [ObjectId(dev) for dev in developer_ids if ObjectId.is_valid(dev)]
        updated_developers = [dev for dev in current_developers if dev not in developer_ids]
    else:
        # If no developer IDs provided, remove all developers
        updated_developers = []

    # Update the project document
    result = await project_collection.update_one(
        {"_id": ObjectId(project_id)},
        {"$set": {"developers": updated_developers}}
    )

    if result.modified_count == 0:
        raise HTTPException(status_code=400, detail="Failed to update developers list")

    return {"message": "Developers removed successfully"}