from fastapi import APIRouter, HTTPException
from models.project_team_model import ProjectTeam
from controllers.manager_controller import (
    create_project_team,
    get_project_team,
    update_project_team,
    delete_project_team,
    get_team_project
)
from typing import List

router = APIRouter(prefix="/project-team", tags=["Project Team"])

# Create a project team
@router.post("/")
async def create_team(projectTeam: ProjectTeam):
    return await create_project_team(projectTeam)

# Get a project team by project ID
@router.get("/{project_id}")
async def get_team(project_id: str):
    return await get_project_team(project_id)

# Update a project team (Add/Remove users)
@router.patch("/{project_id}")
async def update_team(project_id: str, add_users: List[str] = [], remove_users: List[str] = []):
    return await update_project_team(project_id, add_users, remove_users)

# Delete a project team
@router.delete("/{project_id}")
async def delete_team(project_id: str):
    return await delete_project_team(project_id)

@router.get("/team/{team_id}/project", response_model=dict)
async def get_team_project_route(team_id: str):
    return await get_team_project(team_id)