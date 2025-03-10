from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.project_routes import router as project_router
from routes.user_routes import router as user_router
from routes.admin_routes import router as admin_router
from routes.manager_routes import router as project_team_router
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
