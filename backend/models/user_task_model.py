from pydantic import BaseModel, Field, validator
from typing import Optional, Dict, Any
from bson import ObjectId

class UserTask(BaseModel):
    userId: str
    taskId: str

class UserTaskOut(UserTask):
    user_task_id: str = Field(alias='_id')

    @validator('user_task_id', pre=True, always=True)
    def convert_user_task_id(cls, v):
        return str(v) if isinstance(v, ObjectId) else v