# Stage 1: Build Expo web app
FROM node:20-slim AS web-builder
WORKDIR /app
COPY apps/mobile/package*.json ./
RUN npm ci
COPY apps/mobile/ ./
ENV EXPO_PUBLIC_API_URL=https://alphahawk-adventure.up.railway.app
RUN npx expo export --platform web

# Stage 2: Python API
FROM python:3.12-slim
WORKDIR /app
COPY apps/api/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY apps/api/app/ ./app/
COPY --from=web-builder /app/dist/ ./static/
ENV PYTHONUNBUFFERED=1
EXPOSE 8080
CMD uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8080}
