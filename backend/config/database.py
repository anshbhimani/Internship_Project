from motor.motor_asyncio import AsyncIOMotorClient

client = AsyncIOMotorClient('mongodb://localhost:27017/')
db = client['project_manager']
user_collection = db["users"]
project_collection = db['projects']
