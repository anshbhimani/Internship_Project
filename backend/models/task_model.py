from pydantic import BaseModel, Field, field_validator
from typing import Optional, Dict, Any
from bson import ObjectId


class Task(BaseModel):
    id:str
    title: str
    priority: str
    description: str
    totalMinutes: int
    module_id: str
    project_id: str
    status_id: str


class TaskOut(Task):
    id: str = Field(alias='_id')
    module_id: Optional[str] = None
    status_id: Optional[str] = None

    @field_validator('id', 'module_id', 'status_id', mode="before")
    def convert_objectid(cls, v):
        return str(v) if isinstance(v, ObjectId) else v

    @field_validator('project', mode="before",check_fields=False)
    def convert_project(cls, v):
        if isinstance(v, dict) and "_id" in v:
            v["_id"] = str(v["_id"])
        return v