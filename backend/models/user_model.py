from pydantic import BaseModel, EmailStr, Field
from enum import Enum

class RoleEnum(str, Enum):
    admin = "admin"
    manager = "manager"
    developer = "developer"

class UserRegister(BaseModel):
    email: EmailStr
    password: str  # No hashing here
    firstname: str
    role: RoleEnum

class UserRegisterOut(UserRegister):
    id: str = Field(alias="_id")

class UserLogin(BaseModel):
    email: str
    password: str
