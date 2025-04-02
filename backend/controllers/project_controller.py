from models.project_model import Project,ProjectOut
from config.database import project_collection,user_collection,tasks_collection,project_team_collection,project_modules_collection,user_task_collection
from fastapi import HTTPException
from bson import ObjectId

async def create_project(project: Project):
    # Admin creates a project without assigning developers
    project_data = project.dict()
    print(project_data)
    # If you need to process the manager_email, add logic here, e.g., check if manager_email exists in the user database
    manager = await user_collection.find_one({"email": project_data["manager_email"], "role": "manager"})
    if not manager:
        raise HTTPException(status_code=400, detail="Manager not found")

    result = await project_collection.insert_one(project_data)
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
    project = await project_collection.find_one({"_id": ObjectId(project_id)})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    project["_id"] = str(project["_id"])  # Convert `_id` to string
    return project


async def delete_project(project_id: str):
    # Validate project_id
    if not ObjectId.is_valid(project_id):
        raise HTTPException(status_code=400, detail="Invalid project ID format")
    
    # Check if project exists
    project = await project_collection.find_one({"_id": ObjectId(project_id)})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Step 1: Fetch all task IDs associated with this project
    task_ids = await tasks_collection.find({"project_id": ObjectId(project_id)}, {"_id": 1}).to_list(None)
    task_id_list = [task["_id"] for task in task_ids]  # Extract task IDs

    # Debugging prints
    print("Task IDs to delete from user_task_collection:", task_id_list)
    
    # Step 2: Remove these tasks from user_task_collection
    if task_id_list:
        delete_result = await user_task_collection.delete_many(
            {"taskId": {"$in": task_id_list}}
        )
        print(f"Deleted user_task documents: {delete_result.deleted_count}")

    # Step 3: Delete related tasks
    await tasks_collection.delete_many({"project_id": ObjectId(project_id)})

    # Step 4: Delete related modules
    await project_modules_collection.delete_many({"projectId": ObjectId(project_id)})

    # Step 5: Delete related team assignments
    await project_team_collection.delete_many({"project_id": ObjectId(project_id)})

    # Step 6: Remove project references from users
    await user_collection.update_many(
        {},  # Match all users
        {"$pull": {"projects": ObjectId(project_id)}}
    )

    # Step 7: Finally, delete the project itself
    result = await project_collection.delete_one({"_id": ObjectId(project_id)})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=500, detail="Failed to delete project")
    
    return {"message": "Project, tasks, modules, teams, and related data deleted successfully"}

async def get_all_projects():
    projects = await project_collection.find().to_list(None)  # Fetch all projects
    for project in projects:
        project["_id"] = str(project["_id"])  # Convert ObjectId to string  # Convert developer ObjectIds to strings
    return projects

async def assign_manager_to_project(project_id: str, manager_id: str):
    try:
        # Validate if manager_id is a valid ObjectId
        if not ObjectId.is_valid(manager_id):
            raise HTTPException(status_code=400, detail="Invalid manager ID format")

        # Convert manager_id to ObjectId for query
        manager_id_object = ObjectId(manager_id)

        # Fetch manager data from the database
        manager = await user_collection.find_one({"_id": manager_id_object, "role": "manager"})
        if not manager:
            raise HTTPException(status_code=400, detail="Manager not found or invalid role")

        # Convert project_id to ObjectId
        project_id_object = ObjectId(project_id)

        # Update the project with the manager_id
        result = await project_collection.update_one(
            {"_id": project_id_object},
            {"$set": {"manager_id": manager_id_object}}
        )

        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Project not found")

        return {"message": "Manager assigned successfully"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")

async def get_developer_projects(developer_id: str):
    """Retrieve projects assigned to a developer"""
    try:
        developer_id = ObjectId(developer_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid ObjectId format")

    # Step 1: Fetch project team documents where the developer is part of the developers list
    teams_cursor = project_team_collection.find({"developers": developer_id})
    teams = await teams_cursor.to_list(length=None)

    if not teams:
        raise HTTPException(status_code=404, detail="No projects found for the developer")

    # Step 2: Extract project IDs
    project_ids = [team["projectId"] for team in teams]

    # Step 3: Fetch projects from project_collection using these project IDs
    projects_cursor = project_collection.find({"_id": {"$in": project_ids}}, {
        "_id": 1,
        "title": 1,
        "description": 1,
        "technology": 1,
        "estimatedHours": 1,
        "startDate": 1,
        "completionDate": 1
    })
    projects = await projects_cursor.to_list(length=None)

    if not projects:
        raise HTTPException(status_code=404, detail="No Projects found for this developer")

    for project in projects:
        project["_id"] = str(project["_id"])
        
    return projects


async def get_projects_by_manager(manager_id: str):
    try:
        # Ensure the manager_id is valid before making a DB query
        if not ObjectId.is_valid(manager_id):
            raise HTTPException(status_code=400, detail="Invalid manager ID format")

        # Fetch manager by email using the manager_id (assuming manager_id corresponds to manager's email)
        manager = await user_collection.find_one({"_id": ObjectId(manager_id), "role": "manager"})
        if not manager:
            raise HTTPException(status_code=404, detail="Manager not found")

        manager_email = manager["email"]  # Get manager email based on manager_id

        # Fetch projects assigned to the manager by email
        projects = await project_collection.find({"manager_email": manager_email}).to_list(None)

        # If no projects are found, return an empty list
        if not projects:
            return []

        # Format response
        for project in projects:
            project["_id"] = str(project["_id"])
            project["manager_email"] = str(project["manager_email"])
        return projects

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")

async def get_developers_by_manager(manager_id: str):
    # Validate manager_id format
    if not ObjectId.is_valid(manager_id):
        raise HTTPException(status_code=400, detail="Invalid manager ID format")
    
    # Fetch the manager to ensure that the user exists and is a manager
    manager = await user_collection.find_one({"_id": ObjectId(manager_id), "role": "manager"})
    if not manager:
        raise HTTPException(status_code=404, detail="Manager not found")

    # Find developers that are managed by this manager
    developers = await user_collection.find({"manager_id": ObjectId(manager_id), "role": "developer"}).to_list(length=None)
    
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
        project = await project_team_collection.find_one({"projectId": ObjectId(project_id)}, {"developers": 1})
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")

        developer_ids = project.get("developers", [])
        if not developer_ids:
            return []  # Return an empty list if no developers are assigned

        developer_ids = [ObjectId(dev_id) for dev_id in developer_ids]
        # Fetch developers from the database
        developers = await user_collection.find(
            {"_id": {"$in": developer_ids}, "role": "developer"},
            {"_id": 1, "firstname": 1, "email": 1}
        ).to_list(None)

        # Convert ObjectId to string for response
        for dev in developers:
            dev["_id"] = str(dev["_id"])

        return developers
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")


async def delete_project(project_id: str):
    # Validate project_id
    if not ObjectId.is_valid(project_id):
        raise HTTPException(status_code=400, detail="Invalid project ID format")
    
    project_id_obj = ObjectId(project_id)

    # Check if the project exists
    project = await project_collection.find_one({"_id": project_id_obj})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Step 1: Fetch all related task IDs
    task_ids = await tasks_collection.find({"project_id": project_id_obj}, {"_id": 1}).to_list(None)
    task_id_list = [task["_id"] for task in task_ids]  

    # Step 2: Delete related tasks
    if task_id_list:
        await tasks_collection.delete_many({"_id": {"$in": task_id_list}})
    
    # Step 3: Remove tasks from user_task_collection
    if task_id_list:
        await user_task_collection.delete_many({"taskId": {"$in": task_id_list}}
        )

    # Step 4: Delete related modules
    await project_modules_collection.delete_many({"projectId": project_id_obj})

    # Step 5: Delete related team assignments
    await project_team_collection.delete_many({"projectId": project_id_obj})

    # Step 6: Remove assigned developers from the project
    await project_team_collection.update_many(
        {"project_id": project_id_obj},
        {"$pull": {"developers": {"$exists": True}}}
    )

    # Step 7: Remove project references from users
    await user_collection.update_many(
        {},  # Match all users
        {"$pull": {"projects": str(project_id_obj)}}
    )

    # Step 8: Finally, delete the project itself
    result = await project_collection.delete_one({"_id": project_id_obj})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=500, detail="Failed to delete project")
    
    return {"message": "Project and all related data deleted successfully"}