from pydantic import BaseModel, Field, validator
from datetime import datetime
from bson import ObjectId

class ProjectModule(BaseModel):
    projectId: str
    moduleName: str
    description: str
    estimatedHours: int
    status: str
    startDate: str

    @validator('startDate')
    def validate_start_date(cls, v):
        try:
            # Attempt to parse the date in the format "YYYY-MM-DD"
            parsed_date = datetime.strptime(v, '%Y-%m-%d')
            return parsed_date.strftime('%Y-%m-%d')  # Return date in the same format
        except ValueError:
            raise ValueError("startDate must be in 'YYYY-MM-DD' format")
        
    @validator('estimatedHours')
    def validate_estimated_hours(cls,v):
        if(v>0):
            return v
        else:
            raise ValueError("Estimated Hours must be greater than zero")
class ProjectModuleOut(ProjectModule):
    moduleId: str = Field(alias='_id')

    @validator('moduleId', pre=True, always=True)
    def convert_moduleId(cls, v):
        return str(v) if isinstance(v, ObjectId) else v
