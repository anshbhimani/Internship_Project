from pydantic import BaseModel,Field,validator
from bson import ObjectId

class ProjectModule(BaseModel):
    projectId: str
    moduleName: str
    description: str
    estimatedHours: int
    status: str
    startDate: str

class ProjectModuleOut(ProjectModule):
    moduleId: str = Field(alias='_id')

    @validator('moduleId', pre=True, always=True)
    def convert_moduleId(cls, v):
        return str(v) if isinstance(v, ObjectId) else v