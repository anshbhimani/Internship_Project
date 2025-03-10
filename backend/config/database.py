from motor.motor_asyncio import AsyncIOMotorClient

client = AsyncIOMotorClient('mongodb://localhost:27017/')
db = client['project_manager']
user_collection = db["users"]
project_collection = db['projects']
project_modules_collection = db["project_modules"]
status_collection = db["status"]
user_task_colection = db["user_tasks"]
tasks_collection = db["tasks"]
project_team_collection = db["project_team"]