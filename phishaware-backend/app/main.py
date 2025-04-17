from fastapi import FastAPI
from routes.router import router
from config.database import Base, engine
import logging
import os

print("Current working directory:", os.getcwd())
print("Database URL:", os.getenv("DATABASE_URL"))


# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Create database tables
def init_db():
    logger.info("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    logger.info("Tables created successfully.")

# Create FastAPI app
app = FastAPI(title="Phishing Detector API")

# Initialize DB
init_db()

# Include your routes
app.include_router(router)