import logging
from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from fastapi.security import HTTPBearer
from app.config import settings

Path(settings.upload_dir).mkdir(parents=True, exist_ok=True)
from app.routers import auth, quests, users, admin

logger = logging.getLogger("alphahawk")

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
    # Expo tunnel URLs (exp.direct) change every session — allow the whole domain for dev
    allow_origin_regex=r"https://.*\.exp\.direct",
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)

app.include_router(auth.router)
app.include_router(quests.router)
app.include_router(users.router)
app.include_router(admin.router)



@app.get("/")
async def root():
    return {"app": settings.app_name, "docs": "/docs", "status": "ok"}


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.get("/photos/{user_id}/{filename}", include_in_schema=False)
async def serve_photo(user_id: str, filename: str):
    if ".." in user_id or ".." in filename:
        return JSONResponse(status_code=404, content={"detail": "Not found"})
    file_path = Path(settings.upload_dir) / user_id / filename
    if not file_path.is_file():
        return JSONResponse(status_code=404, content={"detail": "Not found"})
    return FileResponse(file_path, media_type="image/jpeg")


@app.get("/{full_path:path}", include_in_schema=False)
async def serve_frontend(full_path: str):
    # Serve the built Expo web app; fall back to index.html for SPA client-side routing.
    static = Path("static")
    file = static / full_path
    if file.is_file():
        return FileResponse(file)
    index = static / "index.html"
    if index.exists():
        return FileResponse(index)
    return JSONResponse(status_code=404, content={"detail": "Not found"})