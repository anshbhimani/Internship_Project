from models.user_model import UserRegister, UserLogin
from config.database import user_collection
from fastapi import HTTPException
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

    return {"message": "Login successful", "user_id": str(existing_user["_id"]),"role":existing_user["role"]}
