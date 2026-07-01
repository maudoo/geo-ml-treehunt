import logging

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.security import HTTPBearer
from app.config import settings
from app.routers import auth, quests, users

logger = logging.getLogger("alphahawk")

security = HTTPBearer()

# debug must never be on in production: Starlette returns full tracebacks
# (including local vars like the JWT secret) to the client when it is.
app = FastAPI(
    title=settings.app_name,
    debug=settings.debug,
)


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    # Log the real error internally, return only a safe message to the client.
    logger.exception("Unhandled error on %s %s", request.method, request.url.path)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"},
    )

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
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