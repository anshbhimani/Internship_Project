from pydantic import BaseModel, Field, validator
from bson import ObjectId

class Status(BaseModel):
    statusName: str

class StatusOut(Status):
    id: str = Field(alias='_id')
    statusName: str

    @validator('id', pre=True, always=True)
    def convert_id(cls, v):
        return str(v) if isinstance(v, ObjectId) else v