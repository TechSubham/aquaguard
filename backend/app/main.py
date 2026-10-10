from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.readings import router as readings_router
from app.routes.auth import router as auth_router
from app.routes.alerts import router as alerts_router
from app.routes.hostels import router as hostels_router
from app.routes.blocks import router as blocks_router
from app.routes.tanks import router as tanks_router
from app.routes.maintenance import router as maintenance_router
from app.routes.water_tests import router as water_tests_router
from app.routes.complaints import router as complaints_router
from app.routes.incidents import router as incidents_router
from app.routes.consumption import router as consumption_router
from app.routes.leakage import router as leakage_router
from app.routes.notifications import router as notifications_router
from app.routes.ai import router as ai_router

from app.services.mqtt_service import start_mqtt

app = FastAPI(
    title="AquaGuard API",
    description="Smart Hostel Water Quality Monitoring & Fleet Management System",
    version="2.0.0"
)

@app.on_event("startup")
def startup_event():
    start_mqtt()

# Enable CORS for Next.js frontend (port 3000) and local access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register All Routers
app.include_router(readings_router)
app.include_router(auth_router)
app.include_router(alerts_router)
app.include_router(hostels_router)
app.include_router(blocks_router)
app.include_router(tanks_router)
app.include_router(maintenance_router)
app.include_router(water_tests_router)
app.include_router(complaints_router)
app.include_router(incidents_router)
app.include_router(consumption_router)
app.include_router(leakage_router)
app.include_router(notifications_router)
app.include_router(ai_router)


@app.get("/")
def root():
    return {
        "service": "AquaGuard API",
        "version": "2.0.0",
        "status": "operational",
        "endpoints": [
            "/readings",
            "/ai",
            "/alerts",
            "/hostels",
            "/blocks",
            "/tanks",
            "/maintenance",
            "/water-tests",
            "/complaints",
            "/incidents",
            "/consumption",
            "/leakage",
            "/notifications",
            "/auth"
        ]
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "database": "connected"
    }