from pydantic import BaseModel,Field,validator
from typing import List, Optional,Dict,Any
from bson import ObjectId


class Task(BaseModel):
    title:str
    priority:str
    description:str
    totalMinutes:int
    module_id:str
    project_id:str
    status_id:str
    
    
class TaskOut(Task):
    id:str = Field(alias='_id')
    project :Optional[Dict[str,Any]] = None
    
    @validator('id',pre=True,always=True)
    def convert_moduleId(cls,v):
        if isinstance(v,ObjectId):
            return str(v)
        return v
    
    @validator("project",pre=True,always=True)
    def convertProjectId(cls,v):
        if isinstance(v,dict) and "_id" in v:
            v[" _id"] = str(v["_id"])
        return v    
    
    @validator("module",pre=True,always=True)
    def convertModuleId(cls,v):
        if isinstance(v,dict) and "_id" in v:
            v[" _id"] = str(v["_id"])
        return v   
    
    @validator("status",pre=True,always=True)
    def convertStatusId(cls,v):
        if isinstance(v,dict) and "_id" in v:
            v[" _id"] = str(v["_id"])
        return v   