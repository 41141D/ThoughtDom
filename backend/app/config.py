import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Postgres in production; sqlite fallback for local/dev so the app
    # boots with zero external services.
    database_url: str = os.getenv("DATABASE_URL", "sqlite:///./thoughtdom.db")

    # Redis is used for rate limiting. If it's unreachable (e.g. local dev
    # without redis running), rate limiting degrades to a no-op instead of
    # crashing the app -- see services/rate_limit.py.
    redis_url: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")

    jwt_secret: str = os.getenv("JWT_SECRET", "dev-secret-change-me")
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24 * 7  # 7 days

    # Rate limit defaults (per-user, per-minute)
    rate_limit_posts_per_min: int = 3
    rate_limit_comments_per_min: int = 10
    rate_limit_votes_per_min: int = 60
    rate_limit_signups_per_hour_per_ip: int = 5
    rate_limit_logins_per_min_per_ip: int = 10

    # Steel-Man Gate: minimum similarity score (0-1) between a challenge's
    # restatement and the original post/comment before it's allowed through.
    steelman_min_similarity: float = 0.25

    # Media uploads. Local disk for now -- swapping to S3/GCS later only
    # touches media.py's save/serve logic, not the MediaAsset schema or the
    # /media/image API contract.
    upload_dir: str = os.getenv("UPLOAD_DIR", "./uploads")
    max_image_bytes: int = 5 * 1024 * 1024  # 5MB, post-compression
    max_image_dimension: int = 2400  # long edge, px
    thumbnail_dimension: int = 480  # long edge, px
    rate_limit_uploads_per_min: int = 12

    class Config:
        env_file = ".env"


settings = Settings()
