from fastapi import HTTPException
from bson import ObjectId
from config.database import project_team_collection, user_collection, project_collection
from controllers.email_controller import send_manager_assignment_email, send_manager_removal_email,send_developer_assigned_email,send_developer_deassigned_email

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
        {"$set": {"manager_id": ObjectId(manager_id), "manager_email": manager.get("email")}}
    )

    if result.modified_count == 0:
        raise HTTPException(status_code=400, detail="Failed to assign manager")
    
    result = await project_team_collection.update_one(
        {"projectId": ObjectId(project_id)},
        {"$set": {"manager_id": ObjectId(manager_id)}}
    )

    if result.modified_count == 0:
        raise HTTPException(status_code=400, detail="Failed to assign manager")
    
    # Send email notification
    await send_manager_assignment_email(manager, project)
    
    return {"message": f"Manager {manager_id} successfully assigned to Project {project_id}"}

# Function to deassign manager from a project
async def deassign_manager_from_project(project_id: str, manager_id: str):
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
        {"$unset": {"manager_id": "", "manager_email": ""}}
    )

    if result.modified_count == 0:
        raise HTTPException(status_code=400, detail="Failed to deassign manager")
    
    # Send email notification
    manager = await user_collection.find_one({"_id": ObjectId(manager_id)})
    if manager:
        await send_manager_removal_email(manager, project)

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

async def assign_developers_to_project(project_id: str, developer_id: str):
    if not ObjectId.is_valid(project_id):
        raise HTTPException(status_code=400, detail="Invalid ID format")
    
    # Validate project existence
    project = await project_collection.find_one({"_id": ObjectId(project_id)})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    developer = await user_collection.find_one({"_id": ObjectId(developer_id), "role": "developer"})
    if not developer:
        raise HTTPException(status_code=400, detail="Developer not found or not a valid developer role")

    # Fetch existing project team entry
    project_team = await project_team_collection.find_one({"projectId": ObjectId(project_id)})
    existing_developers = project_team.get("developers", []) if project_team else []
    existing_developers = [ObjectId(dev) if isinstance(dev, str) else dev for dev in existing_developers]

    # Combine existing and new developers correctly
    if ObjectId(developer_id) in existing_developers:
        raise HTTPException(status_code=400, detail="Developer already assigned to the project")

    # Add the new developer
    updated_developers = existing_developers + [ObjectId(developer_id)]
    
    # Fetch manager ID from email
    manager = await user_collection.find_one({"email": project.get('manager_email')})
    if not manager:
        raise HTTPException(status_code=404, detail="Manager not found")
    
    manager_id = manager['_id']
    manager_email = manager.get('email')

    # Update or create project team entry
    if project_team:
        result = await project_team_collection.update_one(
            {"projectId": ObjectId(project_id)},
            {"$set": {"developers": updated_developers, "manager_id": manager_id}}
        )
        if result.modified_count == 0:
            print("No document was updated. Check if projectId exists in project_team_collection.")
    else:
        insert_result = await project_team_collection.insert_one(
            {"projectId": ObjectId(project_id), "developers": updated_developers, "manager_id": manager_id}
        )
        if not insert_result.inserted_id:
            raise HTTPException(status_code=500, detail="Insertion failed.")
    
     # Send email notification
    send_developer_assigned_email(developer, project, manager_email)
    
    return {"message": "Developers assigned successfully"}

# Function to deassign developers from a project
async def deassign_developers_from_project(project_id: str, developer_id: str):
    if not ObjectId.is_valid(project_id):
        raise HTTPException(status_code=400, detail="Invalid ID format")
    
    # Validate project existence
    project = await project_collection.find_one({"_id": ObjectId(project_id)})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Validate developer
    developer = await user_collection.find_one({"_id": ObjectId(developer_id), "role": "developer"})
    if not developer:
        raise HTTPException(status_code=400, detail="Developer not found or not a valid developer role")

    # Fetch existing project team entry
    project_team = await project_team_collection.find_one({"projectId": ObjectId(project_id)})

    if not project_team:
        raise HTTPException(status_code=404, detail="Project team not found")

    existing_developers = project_team.get("developers", [])

    # Ensure proper ObjectId conversion
    existing_developers = [ObjectId(dev) if isinstance(dev, str) else dev for dev in existing_developers]

     # Check if developer is in the list
    if ObjectId(developer_id) not in existing_developers:
        raise HTTPException(status_code=400, detail="Developer not assigned to this project")

    # Remove only selected developers
    updated_developers = [dev for dev in existing_developers if dev != ObjectId(developer_id)]
    
    # Fetch manager ID from email
    manager = await user_collection.find_one({"email": project.get('manager_email')})
    if not manager:
        raise HTTPException(status_code=404, detail="Manager not found")
    
    manager_email = manager.get('email')

    # Update project team document
    result = await project_team_collection.update_one(
        {"projectId": ObjectId(project_id)},
        {"$set": {"developers": updated_developers}}
    )

    if result.modified_count == 0:
        raise HTTPException(status_code=400, detail="Failed to deassign developers")

    # Send email notification
    send_developer_deassigned_email(developer, project, manager_email)
    return {"message": "Developers deassigned successfully"}
