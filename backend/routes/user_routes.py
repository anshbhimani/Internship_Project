from fastapi import APIRouter, Header,Query
from models.user_model import UserLogin,UserRegister
from controllers.user_controller import user_login,user_register,user_delete,get_all_users

router = APIRouter()

@router.post("/register")
async def register(user: UserRegister):
    return await user_register(user)

@router.post("/login")
async def login(user: UserLogin):
    return await user_login(user)

@router.delete("/delete_user")
async def delete_user(
    email: str = Query(..., description="Email of the user to be deleted"),  # Query parameter for email
    admin_id: str = Header(..., convert_underscores=False)  # Admin ID from headers
):
    return await user_delete(email, admin_id)

@router.get("/users")
async def get_users():
    return await get_all_users()