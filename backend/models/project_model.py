from pydantic import BaseModel, Field, validator
from typing import Optional, List
from bson import ObjectId

class Project(BaseModel):
    title: str
    description: str
    technology: str
    estimatedHours: int
    startDate: str
    completionDate: str
    manager_email:Optional[str]

class ProjectOut(Project):
    project_id: str = Field(alias='_id')
    module_id: Optional[str] = None
    status_id: Optional[str] = None

    @validator('project_id', pre=True, always=True)
    def convert_project_id(cls, v):
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
