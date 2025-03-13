from models.project_team_model import ProjectTeam
from config.database import db
from fastapi import HTTPException
from bson import ObjectId
from typing import List

async def create_project_team(projectTeam: ProjectTeam):
    projectTeam_data = projectTeam.dict()

    try:
        projectTeam_data["projectId"] = ObjectId(projectTeam_data["projectId"])
        projectTeam_data["managerId"] = ObjectId(projectTeam_data["managerId"])
        projectTeam_data["developers"] = [ObjectId(user) for user in projectTeam_data["developers"]]
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid ObjectId format")

    project = await db["projects"].find_one({"_id": projectTeam_data["projectId"]})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Validate developers
    developers_info = []
    for user_id in projectTeam_data["developers"]:
        user = await db["developers"].find_one({"_id": user_id})
        if not user:
            raise HTTPException(status_code=404, detail=f"User {user_id} not found")
        developers_info.append({"id": str(user["_id"]), "name": user["firstname"]})

    # Insert into project_team collection
    projectTeam_data["developers"] = developers_info
    result = await db["project_teams"].insert_one(projectTeam_data)
    return {"message": "Project team created successfully", "id": str(result.inserted_id)}

async def get_project_team(project_id: str):
    try:
        project_id = ObjectId(project_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid ObjectId format")

    team = await db["project_teams"].find_one({"projectId": project_id})
    if not team:
        raise HTTPException(status_code=404, detail="Project team not found")
 
    return {
        "projectId": str(team["projectId"]),
        "developers": team["developers"]
    }
async def update_project_team(project_id: str, add_developers: List[str] = [], remove_developers: List[str] = []):
    try:
        project_id = ObjectId(project_id)
        add_developers = [ObjectId(user) for user in add_developers]
        remove_developers = [ObjectId(user) for user in remove_developers]
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid ObjectId format")

    # Fetch the existing team
    team = await db["project_teams"].find_one({"projectId": project_id})
    if not team:
        raise HTTPException(status_code=404, detail="Project team not found")

    new_developers_info = []
    for user_id in add_developers:
        user = await db["developers"].find_one({"_id": user_id})
        if not user:
            raise HTTPException(status_code=404, detail=f"User {user_id} not found")
        new_developers_info.append({"id": str(user["_id"]), "name": user["firstname"]})
        
    current_developers = set([developer["id"] for developer in team.get("developers", [])])
    add_developers_ids = set([dev["id"] for dev in new_developers_info])
    updated_developers = list(current_developers.union(add_developers_ids) - set(remove_developers))

    # Update the team with the new user list
    await db["project_teams"].update_one(
        {"projectId": project_id},
        {"$set": {"developers": list(new_developers_info)}}  # Store both ID and name in developers
    )

    return {"message": "Project team updated successfully", "developers": new_developers_info}

async def delete_project_team(project_id: str):
    try:
        project_id = ObjectId(project_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid ObjectId format")

    result = await db["project_teams"].delete_one({"projectId": project_id})

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Project team not found")

    return {"message": "Project team deleted successfully"}

async def get_team_project(team_id: str):
    try:
        team_id = ObjectId(team_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid ObjectId format")
    
    # Find the project assigned to the team
    project_team = await db["project_teams"].find_one({"_id": ObjectId(team_id)})
    if not project_team:
        raise HTTPException(status_code=404, detail="Team not found or no project assigned")
    
    project = await db["projects"].find_one({"_id": project_team["projectId"]})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    return {
        "projectId": str(project["_id"]),
        "projectName": project.get("name", "Unknown Project"),
        "description": project.get("description", "No description available"),
        # "managerId": str(project_teams["managerId"]),
        "developers": project_team.get("developers", [])
    }
