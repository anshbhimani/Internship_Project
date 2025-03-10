from pydantic import BaseModel, Field, validator
from typing import Optional, Dict, Any,List
from bson import ObjectId

class Project(BaseModel):
    title: str
    description: str
    technology: str
    estimatedHours: int
    startDate: str
    completionDate: str
    manager_email: str  
    developers: List[str] = []

class ProjectOut(Project):
    projectId: str = Field(alias='_id')

    @validator('projectId', pre=True, always=True)
    def convert_projectId(cls, v):
        return str(v) if isinstance(v, ObjectId) else v
