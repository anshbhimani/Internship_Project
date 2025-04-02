from models.user_model import UserRegister, UserLogin
from config.database import user_collection
from fastapi import HTTPException
import bson
import bcrypt

async def user_register(user: UserRegister):
    # Check if email already exists
    existing_user = await user_collection.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Hash password before storing it
    hashed_password = bcrypt.hashpw(user.password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

    user_data = {
        "firstname": user.firstname,
        "role": user.role,
        "email": user.email,
        "password": hashed_password,  # Store hashed password
    }

    # Insert into MongoDB
    result = await user_collection.insert_one(user_data)
    return {"message": "User registered successfully", "user_id": str(result.inserted_id)}

async def user_login(user: UserLogin):
    existing_user = await user_collection.find_one({"email": user.email})

    if not existing_user:
        raise HTTPException(status_code=404, detail="Invalid email or password")

    stored_password = existing_user["password"].encode("utf-8")  # Stored hashed password

    # Compare input password (plain text) with stored hashed password
    if not bcrypt.checkpw(user.password.encode("utf-8"), stored_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    return {"message": "Login successful", "user_id": str(existing_user["_id"]),"role":existing_user["role"],"name":existing_user["firstname"]}

async def user_delete(email: str, admin_id: str):
    # Validate if admin_id is a valid ObjectId
    if not bson.ObjectId.is_valid(admin_id):
        raise HTTPException(status_code=400, detail="Invalid admin ID format")

    # Check if admin exists and has the admin role
    admin_user = await user_collection.find_one({"_id": bson.ObjectId(admin_id)})
    
    if not admin_user or admin_user["role"] != "admin":
        raise HTTPException(status_code=401, detail="Unauthorized: Only admins can delete users")

    # Check if the user to be deleted exists
    existing_user = await user_collection.find_one({"email": email})

    if not existing_user:
        raise HTTPException(status_code=404, detail="User not found")

    # Delete the user
    await user_collection.delete_one({"email": email})
    
    return {"message": "User deleted successfully", "user_id": str(existing_user["_id"])}

async def get_all_users():
    users = await user_collection.find().to_list(length=None)  
    return [{"id": str(user["_id"]), "firstname": user["firstname"], "role": user["role"], "email": user["email"]} for user in users]