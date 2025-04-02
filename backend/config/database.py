from motor.motor_asyncio import AsyncIOMotorClient

from dotenv import load_dotenv
import os

load_dotenv()
mongo_db_url = os.getenv('MONGODB_URL')
client = AsyncIOMotorClient(mongo_db_url)
db = client['project_manager']
user_collection = db['users']
project_collection = db['projects']
project_modules_collection = db['project_modules']
status_collection = db['status']
user_task_collection = db['user_tasks']
tasks_collection = db['tasks']
project_team_collection = db['project_teams']