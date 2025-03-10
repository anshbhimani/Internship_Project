from models.project_model import Project
from config.database import db
from fastapi import HTTPException
from typing import List
from bson import ObjectId
from fastapi import Request


async def create_project(project: Project):
    # Admin creates a project without assigning developers
    project_data = project.dict()
    project_data["developers"] = []  # Empty list since developers are assigned later

    # If you need to process the manager_email, add logic here, e.g., check if manager_email exists in the user database
    manager = await db["users"].find_one({"email": project_data["manager_email"], "role": "manager"})
    if not manager:
        raise HTTPException(status_code=400, detail="Manager not found")

    result = await db["projects"].insert_one(project_data)
    project_data["_id"] = str(result.inserted_id)  # Convert ObjectId to string

    return project_data

    # Expected Input:
#     {
#   "title": "string",
#   "description": "string",
#   "technology": "string",
#   "estimated_hours": 0,
#   "start_date": "string",
#   "completion_date": "string",
#   "developers": [
#     "67c5500aa08dfb21e5bba760"
#   ]
# }

async def get_project(project_id: str):
    project = await db["projects"].find_one({"_id": ObjectId(project_id)})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    project["_id"] = str(project["_id"])  # Convert `_id` to string
    project["developers"] = [str(dev) for dev in project["developers"]]
    return project


async def delete_project(project_id: str):
    result = await db["projects"].delete_one({"_id": project_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Project not found")
    return {"message": "Project deleted"}


async def get_all_projects():
    projects = await db["projects"].find().to_list(None)  # Fetch all projects
    for project in projects:
        project["_id"] = str(project["_id"])  # Convert ObjectId to string
        project["developers"] = [str(dev) for dev in project["developers"]]  # Convert developer ObjectIds to strings
    return projects

async def assign_manager_to_project(project_id: str, manager_id: str):
    try:
        # Validate if manager_id is a valid ObjectId
        if not ObjectId.is_valid(manager_id):
            raise HTTPException(status_code=400, detail="Invalid manager ID format")

        # Convert manager_id to ObjectId for query
        manager_id_object = ObjectId(manager_id)

        # Fetch manager data from the database
        manager = await db["users"].find_one({"_id": manager_id_object, "role": "manager"})
        if not manager:
            raise HTTPException(status_code=400, detail="Manager not found or invalid role")

        # Convert project_id to ObjectId
        project_id_object = ObjectId(project_id)

        # Update the project with the manager_id
        result = await db["projects"].update_one(
            {"_id": project_id_object},
            {"$set": {"manager_id": manager_id_object}}
        )

        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Project not found")

        return {"message": "Manager assigned successfully"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")


async def get_projects_by_manager(manager_id: str):
    try:
        # Ensure the manager_id is valid before making a DB query
        if not ObjectId.is_valid(manager_id):
            raise HTTPException(status_code=400, detail="Invalid manager ID format")

        # Fetch manager by email using the manager_id (assuming manager_id corresponds to manager's email)
        manager = await db["users"].find_one({"_id": ObjectId(manager_id), "role": "manager"})
        if not manager:
            raise HTTPException(status_code=404, detail="Manager not found")

        manager_email = manager["email"]  # Get manager email based on manager_id

        # Fetch projects assigned to the manager by email
        projects = await db["projects"].find({"manager_email": manager_email}).to_list(None)

        # If no projects are found, return an empty list
        if not projects:
            return []

        # Format response
        for project in projects:
            project["_id"] = str(project["_id"])
            project["manager_email"] = str(project["manager_email"])
            project["developers"] = [str(dev) for dev in project["developers"]]

        return projects

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")

async def assign_developers(project_id: str, manager_id: str, developers: List[str]):
    # Validate project existence
    project = await db["projects"].find_one({"_id": ObjectId(project_id)})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Validate project manager
    project_manager = await db["users"].find_one({"email": project["manager_email"], "role": "manager"})
    if not project_manager:
        raise HTTPException(status_code=404, detail="Project manager not found")

    # Ensure the requesting manager is the same as the project manager
    if str(project_manager["_id"]) != manager_id:
        raise HTTPException(status_code=403, detail="Only the assigned manager can assign developers")

    # Convert developer IDs to ObjectId
    developer_ids = [ObjectId(dev) for dev in developers]

    # Fetch developers and validate their manager
    assigned_developers = await db["users"].find({"_id": {"$in": developer_ids}, "role": "developer"}).to_list(None)

    if len(assigned_developers) != len(developer_ids):
        raise HTTPException(status_code=400, detail="Some developers not found")

    # Ensure all developers have the same manager as the project
    for dev in assigned_developers:
        if "manager_id" not in dev or str(dev["manager_id"]) != manager_id:
            raise HTTPException(status_code=400, detail="One or more developers do not belong to this manager")

    # Append new developers to the project (avoid duplicates)
    updated_developers = list(set(project["developers"] + developer_ids))

    await db["projects"].update_one(
        {"_id": ObjectId(project_id)},
        {"$set": {"developers": updated_developers}}
    )

    return {"message": "Developers assigned successfully"}

async def get_developers_by_manager(manager_id: str):
    # Validate manager_id format
    if not ObjectId.is_valid(manager_id):
        raise HTTPException(status_code=400, detail="Invalid manager ID format")
    
    # Fetch the manager to ensure that the user exists and is a manager
    manager = await db["users"].find_one({"_id": ObjectId(manager_id), "role": "manager"})
    if not manager:
        raise HTTPException(status_code=404, detail="Manager not found")

    # Find developers that are managed by this manager
    developers = await db["users"].find({"manager_id": ObjectId(manager_id), "role": "developer"}).to_list(length=None)
    
    if not developers:
        return []  # If no developers are found, return an empty list

    # Format the response to convert ObjectId to string
    for dev in developers:
        dev["_id"] = str(dev["_id"])
        dev["manager_id"] = str(dev["manager_id"])  # Optional, if you want to return the manager ID as well

    return developers

async def get_assigned_developers(project_id: str):
    try:
        # Validate if project_id is a valid ObjectId
        if not ObjectId.is_valid(project_id):
            raise HTTPException(status_code=400, detail="Invalid project ID format")

        # Fetch project from database
        project = await db["projects"].find_one({"_id": ObjectId(project_id)}, {"developers": 1})
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")

        developer_ids = project.get("developers", [])
        if not developer_ids:
            return []  # Return an empty list if no developers are assigned

        # Fetch developers from the database
        developers = await db["users"].find(
            {"_id": {"$in": developer_ids}, "role": "developer"},
            {"_id": 1, "firstname": 1, "email": 1}
        ).to_list(None)

        # Convert ObjectId to string for response
        for dev in developers:
            dev["_id"] = str(dev["_id"])

        return developers
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")
    
async def remove_developer(project_id: str, developer_id: str):
    project = await db["projects"].find_one({"_id": ObjectId(project_id)})
    
    if not project:
        return {"error": "Project not found"}

    developer_object_id = ObjectId(developer_id)
    updated_developers = [dev for dev in project.get("developers", []) if dev != developer_object_id]

    await db["projects"].update_one(
        {"_id": ObjectId(project_id)}, 
        {"$set": {"developers": updated_developers}}
    )

    return {"message": "Developer removed successfully"}