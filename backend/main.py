from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.project_routes import router as project_router
from routes.user_routes import router as user_router
from routes.admin_routes import router as admin_router
from routes.manager_routes import router as project_team_router
from routes.task_routes import router as task_router
from routes.project_module_routes import router as project_module_router
from routes.user_task_routes import router as user_task_router
from routes.status_routes import router as status_router
import logging

logging.basicConfig(level=logging.DEBUG, format="%(asctime)s - %(levelname)s - %(message)s",filename="Logs.log")

# FastAPI app setup
app = FastAPI()
logging.info("Root endpoint hit")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(project_router)
app.include_router(user_router)
app.include_router(admin_router)
app.include_router(project_team_router)
app.include_router(task_router)
app.include_router(project_module_router)
app.include_router(user_task_router)
app.include_router(status_router)