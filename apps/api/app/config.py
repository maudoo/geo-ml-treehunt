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


    # Storage
    gcs_bucket: str = "geo-ml-treehunt-photos"

    # Game
    points_per_quest: int = 100

    # Quests
    quest_proximity_meters: int = 100

    # CORS
    cors_origins: str = "http://localhost:8081,http://localhost:19006"

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

settings = Settings()
