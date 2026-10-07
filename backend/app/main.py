from fastapi import FastAPI

from app.routes.readings import router as readings_router


app = FastAPI(
    title="AquaGuard API",
    description="Smart Hostel Water Quality Monitoring System",
    version="1.0.0"
)


app.include_router(readings_router)


@app.get("/")
def root():
    return {
        "message": "AquaGuard API is running"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }