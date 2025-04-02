from pydantic import BaseModel, Field, field_validator
from typing import Optional
from bson import ObjectId
from fastapi import File,UploadFile

class Task(BaseModel):
    id:str
    title: str
    priority: str
    description: str
    totalMinutes: int
    module_id: str
    project_id: str
    status_id: str
    image: Optional[UploadFile] = File(None)  # Make image optional
    
class TaskOut(Task):
    id: str = Field(alias='_id')
    module_id: Optional[str] = None
    project_id: Optional[str] = None  
    status_id: Optional[str] = None
    ui_image_url:Optional[str] = None

    @field_validator('id', 'project_id','module_id', 'status_id', mode="before")
    def convert_objectid(cls, v):
        return str(v) if isinstance(v, ObjectId) else v

    @field_validator('project', mode="before",check_fields=False)
    def convert_project(cls, v):
        if isinstance(v, dict) and "_id" in v:
            v["_id"] = str(v["_id"])
        return v