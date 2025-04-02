from pydantic import BaseModel, Field, validator
from bson import ObjectId
from typing import Optional

class Status(BaseModel):
    status: str = Field(alias='status')

class StatusOut(BaseModel):
    id: str = Field(alias='_id')
    status: str
    
    @validator('id', pre=True, always=True)
    def convert_id(cls, v):
        return str(v) if isinstance(v, ObjectId) else v