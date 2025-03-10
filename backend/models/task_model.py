from pydantic import BaseModel, Field, validator
from typing import Optional, Dict, Any
from bson import ObjectId


class Task(BaseModel):
    title: str
    priority: str
    description: str
    totalMinutes: int
    module_id: str
    project_id: str
    status_id: str


class TaskOut(Task):
    id: str = Field(alias='_id')
    project: Optional[Dict[str, Any]] = None
    module_id: Optional[str] = None
    status_id: Optional[str] = None

    @validator('id', pre=True, always=True)
    def convert_id(cls, v):
        return str(v) if isinstance(v, ObjectId) else v

    @validator('project', pre=True, always=True)
    def convert_project(cls, v):
        if isinstance(v, dict) and "_id" in v:
            v["_id"] = str(v["_id"])
        return v

    @validator('module_id', pre=True, always=True)
    def convert_module_id(cls, v):
        return str(v) if isinstance(v, ObjectId) else v

    @validator('status_id', pre=True, always=True)
    def convert_status_id(cls, v):
        return str(v) if isinstance(v, ObjectId) else v
