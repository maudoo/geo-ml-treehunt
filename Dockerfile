# Stage 1: Build Expo web app
FROM node:20-alpine AS web-builder
WORKDIR /web
COPY apps/mobile/package*.json ./
RUN npm ci --legacy-peer-deps
COPY apps/mobile/ ./
# Empty string → Axios uses relative URLs → same origin as the API
ENV EXPO_PUBLIC_API_URL=""
RUN npx expo export --platform web

# Stage 2: FastAPI + built web app as static files
FROM python:3.12-slim
WORKDIR /app
COPY apps/api/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY apps/api/app/ ./app/
COPY --from=web-builder /web/dist/ ./static/
ENV PYTHONUNBUFFERED=1
EXPOSE 8080
CMD uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8080}
