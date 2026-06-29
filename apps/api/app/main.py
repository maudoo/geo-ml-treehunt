from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer
from app.config import settings
from app.routers import auth, quests, users

security = HTTPBearer()

app = FastAPI(
    title=settings.app_name,
    debug=settings.debug,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)

app.include_router(auth.router)
app.include_router(quests.router)
app.include_router(users.router)



@app.get("/")
async def root():
    return {"message": "Alphahawk API is running!"}


@app.get("/health")
async def health():
    return {"status": "ok"}