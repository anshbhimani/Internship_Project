from pydantic import BaseModel, Field, validator
from typing import Optional, List
from bson import ObjectId

class Project(BaseModel):
    project_id: str
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
    module_id: Optional[str] = None
    status_id: Optional[str] = None

    @validator('projectId', pre=True, always=True)
    def convert_projectId(cls, v):
        return str(v) if isinstance(v, ObjectId) else v

    @validator('module_id', pre=True, always=True)
    def convert_module_id(cls, v):
        return str(v) if isinstance(v, ObjectId) else v
    
    @validator('status_id', pre=True, always=True)
    def convert_status_id(cls, v):
        return str(v) if isinstance(v, ObjectId) else v

    class Config:
        json_encoders = {
            ObjectId: lambda v: str(v)
        }
