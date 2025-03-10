from fastapi import APIRouter, Depends
from models.user_model import UserLogin,UserRegister
from controllers.user_controller import user_login,user_register

router = APIRouter()

@router.post("/register")
async def register(user: UserRegister):
    return await user_register(user)

@router.post("/login")
async def login(user: UserLogin):
    return await user_login(user)
