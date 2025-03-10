from pydantic import BaseModel, Field, validator
from typing import Optional, Dict, Any
from bson import ObjectId

class ProjectTeam(BaseModel):
    projectId: str
    userId: str

class ProjectTeamOut(ProjectTeam):
    project_team_id: str = Field(alias='_id')

    @validator('project_team_id', pre=True, always=True)
    def convert_project_team_id(cls, v):
        return str(v) if isinstance(v, ObjectId) else v