from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        )

    #App
    app_name: str = "AlphaHawk API"
    debug: bool = False

    # Database
    database_url: str
    database_ssl: bool = False

    #Auth
    jwt_secret_key: str
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 1440 #if someone steals a token, it only works for 24 hours maximum.


    # CORS — comma-separated list of allowed origins
    cors_origins: str = "http://localhost:8081,http://localhost:19006"

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    # Storage
    gcs_bucket: str = "geo-ml-treehunt-photos"
    max_photo_bytes: int = 10 * 1024 * 1024  # 10 MB cap on quest photo uploads

    # Admin panel
    admin_username: str = "admin"
    admin_password: str

    # Game
    points_per_quest: int = 100
    quest_proximity_meters: int = 100  # how close a user must be to a tree to complete its quest

settings = Settings()
