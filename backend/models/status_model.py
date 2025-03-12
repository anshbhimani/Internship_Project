from pydantic import BaseModel, Field, validator
from bson import ObjectId
from typing import Optional

class Status(BaseModel):
    status: str = Field(alias='status')

class StatusOut(BaseModel):
    _id: str
    status: str
    
    @classmethod
    def from_mongo(cls, data: dict):
        # Ensure _id exists before converting
        if '_id' in data and isinstance(data['_id'], ObjectId):
            data['_id'] = str(data['_id'])  # Convert ObjectId to string
        return cls(**data)