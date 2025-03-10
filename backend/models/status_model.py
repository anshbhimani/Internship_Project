from pydantic import BaseModel, Field, validator
from typing import Optional, Dict, Any
from bson import ObjectId

class Status(BaseModel):
    statusName: str

class StatusOut(Status):
    statusId: str = Field(alias='_id')

    @validator('statusId', pre=True, always=True)
    def convert_statusId(cls, v):
        return str(v) if isinstance(v, ObjectId) else v