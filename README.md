# AlphaHawk 🌳

**A location-based campus tree-hunting game.** Students get assigned a real tree from the campus inventory, navigate to it on a map, photograph it on location, and earn XP toward an 8-level progression — turning a biodiversity dataset into a game.

<p>
  <img alt="FastAPI" src="https://img.shields.io/badge/FastAPI-async-009688?logo=fastapi&logoColor=white">
  <img alt="React Native" src="https://img.shields.io/badge/React%20Native-Expo-000020?logo=expo&logoColor=white">
  <img alt="Postgres" src="https://img.shields.io/badge/Postgres-PostGIS-4169E1?logo=postgresql&logoColor=white">
  <img alt="Cloud Run" src="https://img.shields.io/badge/Google%20Cloud-Run-4285F4?logo=googlecloud&logoColor=white">
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white">
</p>

---

## What it is

AlphaHawk gamifies exploring the trees on a college campus. Each tree in the campus inventory has a species, a tag, and GPS coordinates. The app hands a player one tree at a time as a **timed quest**; the player walks to it, snaps a geotagged photo, and the backend awards XP and advances their level. A leaderboard ranks everyone by XP, and an admin panel lets a moderator review submitted photos and ban abusive accounts.

The interesting part is that the game rules live **server-side** — XP, leveling, quest expiry, GPS proximity, and photo-ownership checks are all enforced by the API, so the client is never the source of truth.

> **Live API docs:** [`/docs`](https://geo-ml-treehunt-api-858416453237.us-east1.run.app/docs) · **Health:** [`/health`](https://geo-ml-treehunt-api-858416453237.us-east1.run.app/health)

---

## Features

- 🔐 **JWT auth** — register / login, tokens stored in the device's secure store; banned users are auto-logged-out by an Axios interceptor.
- 🗺️ **Quest loop** — assign a random uncompleted tree → navigate via an in-app map → photograph → submit → earn XP.
- ⏱️ **Timed quests** — each quest expires 30 minutes after assignment; expired quests can be dismissed and the tree returns to the pool.
- 📍 **GPS proximity verification** — submissions are checked against the tree's real coordinates with PostGIS `ST_DWithin` *(currently toggled off for testing — see [Roadmap](#roadmap--known-limitations))*.
- 📸 **Direct-to-bucket photo upload** — the client uploads straight to Google Cloud Storage via a short-lived **signed URL**, with a max file size baked into the signature so oversized uploads are rejected at the bucket.
- 🏆 **XP & 8-level progression** — a server-authoritative XP curve; each level has its own hawk avatar.
- 📊 **Leaderboard & quest history**.
- 🛡️ **Admin moderation panel** — a Basic-Auth-protected web page to review submitted photos and ban / unban users.
- 🧯 **Production hardening** — React error boundaries, skeleton loaders, haptics, web support, and a global exception handler that never leaks tracebacks to clients.

---

## Tech stack

| Layer | Tools |
|---|---|
| **Mobile** | React Native · Expo · `expo-router` · TypeScript · Zustand · Axios · `react-native-maps` · `expo-camera` · `expo-location` · Reanimated |
| **Backend** | FastAPI · SQLAlchemy 2 (async) · `asyncpg` · Pydantic v2 · GeoAlchemy2 / PostGIS · `python-jose` (JWT) · `passlib` + `bcrypt` |
| **Data** | Neon (serverless Postgres) + PostGIS · Google Cloud Storage (photos) |
| **Infra** | Docker · Google Cloud Run · Artifact Registry · GitHub Actions (CI/CD) |

---

## Architecture

The API follows a clean **router → service → model** layering: routers handle HTTP and validation, services hold all business logic and DB access, models are the SQLAlchemy tables.

```
alphahawk/
├── apps/
│   ├── api/                     # FastAPI backend (deployed to Cloud Run)
│   │   ├── app/
│   │   │   ├── main.py          # app, CORS, global exception handler, routers
│   │   │   ├── config.py        # Pydantic Settings (env-driven)
│   │   │   ├── database.py      # async engine + get_db() session
│   │   │   ├── core/            # security (JWT/bcrypt), dependencies (auth guards)
│   │   │   ├── models/          # User, Tree, Quest  (SQLAlchemy)
│   │   │   ├── schemas/         # Pydantic request/response models
│   │   │   ├── routers/         # auth, quests, users, admin
│   │   │   └── services/        # auth, quest, leveling, admin  (business logic)
│   │   └── requirements.txt
│   └── mobile/                  # Expo / React Native app
│       ├── app/                 # expo-router routes: (auth), (tabs), (quest)
│       └── src/                 # api client, components, hooks, stores, lib
├── infra/db/schema.sql          # Postgres + PostGIS schema (source of truth)
└── .github/workflows/deploy.yml # CI/CD to Cloud Run
```

**The quest loop:**

```
assign ──► active quest (30-min timer)
               │
               ├─ navigate to tree (map)
               ├─ take photo ──► request signed URL ──► PUT image to GCS
               └─ submit {photo_url, lat, lng}
                        │
                        ▼
        server verifies: ownership · not expired · photo in your bucket folder · (proximity)
                        │
                        ▼
              completed ──► +100 XP ──► level recalculated ──► leaderboard updated
```

---

## API overview

All quest/user routes require a `Bearer` JWT. Full interactive docs at `/docs`.

| Method | Route | Purpose |
|---|---|---|
| `POST` | `/auth/register` | Create account, returns JWT |
| `POST` | `/auth/login` | Log in, returns JWT |
| `POST` | `/quests/assign` | Assign a random uncompleted tree |
| `GET` | `/quests/me` | Current active quest |
| `POST` | `/quests/upload-url` | Get a signed GCS upload URL |
| `POST` | `/quests/{id}/submit` | Submit photo + location to complete |
| `POST` | `/quests/{id}/cancel` | Cancel active quest (tree back to pool) |
| `POST` | `/quests/{id}/dismiss` | Dismiss an expired quest |
| `GET` | `/quests/history` | Player's quest history |
| `GET` | `/quests/leaderboard` | Top 10 players by XP |
| `GET` | `/users/me` | Profile: XP, level, rank, trees found |
| `GET` | `/admin` | Moderation panel *(Basic Auth)* |
| `POST` | `/admin/users/{id}/ban` · `/unban` | Ban / unban a user *(Basic Auth)* |

---

## Local development

### Prerequisites
- Python 3.11+, Node 18+, a Postgres database with the **PostGIS** extension, and a Google Cloud Storage bucket (for photo uploads).

### Backend

```bash
cd apps/api
python -m venv venv && source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt

# apply the schema to your Postgres (PostGIS must be enabled).
# use a plain postgresql:// URL here — psql doesn't understand the +asyncpg driver suffix.
psql "postgresql://user:pass@host/db" -f ../../infra/db/schema.sql

# create apps/api/.env (see table below), then:
uvicorn app.main:app --reload
```

### Mobile

```bash
cd apps/mobile
npm install
npx expo start --tunnel        # --tunnel is reliable across networks; or --web for browser
```

Point the app at your API base URL in `apps/mobile/src/api/client.ts`.

### Backend environment variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | Async Postgres URL (`postgresql+asyncpg://…`) |
| `DATABASE_SSL` | | `true` for managed Postgres (e.g. Neon) |
| `JWT_SECRET_KEY` | ✅ | Secret for signing JWTs |
| `ADMIN_USERNAME` / `ADMIN_PASSWORD` | ✅ | Credentials for the `/admin` panel |
| `GCS_BUCKET` | | Cloud Storage bucket for quest photos |
| `CORS_ORIGINS` | | Comma-separated allowed origins |

---

## Deployment

Pushing to `main` with changes under `apps/api/**` triggers [`deploy.yml`](.github/workflows/deploy.yml): GitHub Actions builds the Docker image, pushes it to Artifact Registry, and deploys a new **Cloud Run** revision. Secrets (`DATABASE_URL`, `JWT_SECRET_KEY`, `ADMIN_PASSWORD`, …) are injected as environment variables at deploy time.

On Cloud Run, GCS upload URLs are signed via the **IAM SignBlob API** using the runtime service account — no private key file is shipped with the app.

---

## Engineering highlights

- **Server-authoritative game rules.** XP, the leveling curve, quest expiry, and proximity all live in the backend; the client only renders state.
- **Signed, size-bounded uploads.** The upload URL binds a `x-goog-content-length-range` header into the v4 signature, so the bucket itself rejects oversized files — no proxying image bytes through the API.
- **Keyless signing on serverless.** Cloud Run's service account has no downloadable key, so signing uses `google.auth.default()` + the IAM SignBlob API.
- **Abuse resistance.** Quests verify ownership on every action, and a submitted `photo_url` must live under the caller's own folder in the bucket before it's accepted.
- **No leaked internals.** A global exception handler logs the real error server-side and returns only a generic 500 to clients.

---

## Roadmap / known limitations

- **Proximity check is currently disabled** (commented in `quest_service.py`) to make testing easier off-campus — re-enable before real use.
- **Password reset was removed** — reliable transactional email requires a verified sending domain, which the project doesn't have yet.
- The campus tree inventory is **proprietary data** and is not included in this repo.

---

## Author

Built by [**@maudoo**](https://github.com/maudoo) as a full-stack portfolio project — spanning a geospatial API, a native mobile app, cloud infrastructure, and CI/CD.

## Acknowledgements

Developed with [**Claude Code**](https://claude.com/claude-code) (Anthropic's Claude) as a pair-programming partner — used throughout for architecture discussion, implementation, debugging, and code review.
