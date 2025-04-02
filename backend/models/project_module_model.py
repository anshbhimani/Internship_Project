from pydantic import BaseModel, Field, validator
from datetime import datetime
from bson import ObjectId

class ProjectModule(BaseModel):
    projectId: str
    moduleName: str
    description: str
    estimatedHours: int
    status: str
    startDate: str
    
    @validator('estimatedHours')
    def validate_estimated_hours(cls,v):
        if(v>0):
            return v
        else:
            raise ValueError("Estimated Hours must be greater than zero")
    
    @validator('projectId', pre=True, always=True)
    def convert_ProjectId(cls, v):
        return str(v) if isinstance(v, ObjectId) else v
      
class ProjectModuleOut(BaseModel):
    moduleId: str = Field(alias='_id')
    projectId: str
    moduleName: str
    description: str
    estimatedHours: int
    status: str
    startDate: str
    project_name:str

    @validator('moduleId', pre=True, always=True)
    def convert_moduleId(cls, v):
        return str(v) if isinstance(v, ObjectId) else v
    
    @validator('projectId', pre=True, always=True)
    def convert_ProjectId(cls, v):
        return str(v) if isinstance(v, ObjectId) else v
    
    @validator('status', pre=True, always=True)  # ✅ Convert ObjectId to string
    def convert_status(cls, v):
        return str(v) if isinstance(v, ObjectId) else v