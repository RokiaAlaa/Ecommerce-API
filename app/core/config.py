from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_hostname: str
    database_port: str
    database_password: str
    database_name: str
    database_username: str

    redis_hostname: str
    redis_port: str
    redis_password: str
    redis_db: str

    secret_key: str
    algorithm: str
    access_token_expire_minutes: int

    app_name: str = "E-commerce API"
    debug: bool = False
    api_v1_prefix: str = "/api/v1"

    model_config = SettingsConfigDict(env_file=".env")


settings = Settings()
