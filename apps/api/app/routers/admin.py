import uuid
from pathlib import Path
import httpx
from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import HTMLResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.core.dependencies import get_admin
from app.services.admin_service import get_completed_quests, set_user_active
from app.models.quest import Quest
from app.config import settings

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("", response_class=HTMLResponse)
async def admin_panel(
    _: str = Depends(get_admin),
    db: AsyncSession = Depends(get_db),
):
    quests = await get_completed_quests(db)

    rows = ""
    for q in quests:
        photo_cell = f'<img src="{q.photo_url}" width="120" style="border-radius:6px">' if q.photo_url else '<span style="color:#aaa;font-size:12px">No photo</span>'
    rows += f"""
        <tr>
            <td>{photo_cell}</td>
            <td>
                <strong>{q.tree.common_name}</strong><br>
                <small><em>{q.tree.scientific_name}</em></small>
            </td>
            <td>
                {q.user.display_name}<br>
                <small style="color:#888">{q.user.email}</small><br>
                <small style="color:{'red' if not q.user.is_active else '#888'}">
                    {'BANNED' if not q.user.is_active else ''}
                </small>
            </td>
            <td>{str(q.completed_at)[:10]}</td>
            <td>
                {'<form method="post" action="/admin/users/' + str(q.user_id) + '/unban"><button style="background:#2d6a4f;color:white;padding:6px 12px;border:none;border-radius:4px;cursor:pointer">Unban</button></form>'
                 if not q.user.is_active else
                 '<form method="post" action="/admin/users/' + str(q.user_id) + '/ban"><button style="background:#c0392b;color:white;padding:6px 12px;border:none;border-radius:4px;cursor:pointer">Ban</button></form>'}
            </td>
        </tr>
        """

    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <title>AlphaHawk Admin</title>
        <style>
            body {{ font-family: sans-serif; padding: 32px; background: #f9f9f9; }}
            h1 {{ color: #1b4332; }}
            table {{ border-collapse: collapse; width: 100%; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 4px rgba(0,0,0,0.1); }}
            th {{ background: #2d6a4f; color: white; padding: 12px 16px; text-align: left; }}
            td {{ padding: 12px 16px; border-bottom: 1px solid #eee; vertical-align: middle; }}
            tr:last-child td {{ border-bottom: none; }}
        </style>
    </head>
    <body>
        <h1>🌳 AlphaHawk Admin</h1>
        <p style="color:#555">{len(quests)} completed quests</p>
        <table>
            <thead><tr>
                <th>Photo</th><th>Tree</th><th>User</th><th>Date</th><th>Action</th>
            </tr></thead>
            <tbody>{rows}</tbody>
        </table>
    </body>
    </html>
    """


@router.post("/users/{user_id}/ban", response_class=HTMLResponse)
async def ban_user(
    user_id: uuid.UUID,
    _: str = Depends(get_admin),
    db: AsyncSession = Depends(get_db),
):
    user = await set_user_active(db, user_id, is_active=False)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
    return "<script>window.location='/admin'</script>"


@router.post("/users/{user_id}/unban", response_class=HTMLResponse)
async def unban_user(
    user_id: uuid.UUID,
    _: str = Depends(get_admin),
    db: AsyncSession = Depends(get_db),
):
    user = await set_user_active(db, user_id, is_active=True)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
    return "<script>window.location='/admin'</script>"


@router.post("/migrate-photos")
async def migrate_gcs_photos(
    request: Request,
    _: str = Depends(get_admin),
    db: AsyncSession = Depends(get_db),
):
    """One-time migration: download completed quest photos from GCS → Railway volume."""
    result = await db.execute(
        select(Quest).where(
            Quest.status == "completed",
            Quest.photo_url.like("https://storage.googleapis.com/%"),
        )
    )
    quests = result.scalars().all()

    scheme = request.headers.get("x-forwarded-proto", request.url.scheme)
    host = request.headers.get("host", str(request.url.hostname))

    migrated, failed = [], []

    async with httpx.AsyncClient(timeout=30) as http:
        for quest in quests:
            try:
                resp = await http.get(quest.photo_url)
                if resp.status_code != 200:
                    failed.append({"id": str(quest.id), "reason": f"GCS {resp.status_code}"})
                    continue
                user_dir = Path(settings.upload_dir) / str(quest.user_id)
                user_dir.mkdir(parents=True, exist_ok=True)
                filename = f"{quest.id}.jpg"
                (user_dir / filename).write_bytes(resp.content)
                quest.photo_url = f"{scheme}://{host}/photos/{quest.user_id}/{filename}"
                migrated.append(str(quest.id))
            except Exception as e:
                failed.append({"id": str(quest.id), "reason": str(e)})

    await db.commit()
    return {"migrated": len(migrated), "failed": failed}
