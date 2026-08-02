from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.auth import create_access_token, hash_password, verify_password
from app.database import get_db
from app.config import settings
from app.models import User
from app.schemas import LoginRequest, RegisterRequest, TokenResponse
from app.services.rate_limit import check_rate_limit
from app.services.username_gen import generate_username

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=TokenResponse)
def register(payload: RegisterRequest, request: Request, db: Session = Depends(get_db)):
    client_ip = request.client.host if request.client else "unknown"
    if not check_rate_limit(
        f"signup:{client_ip}", settings.rate_limit_signups_per_hour_per_ip, 3600
    ):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many accounts created from this network recently.",
        )

    username = payload.preferred_username
    if username:
        exists = db.query(User).filter(User.username == username).first()
        if exists:
            username = None  # fall back to random generation below

    if not username:
        for _ in range(10):
            candidate = generate_username()
            if not db.query(User).filter(User.username == candidate).first():
                username = candidate
                break
        else:
            raise HTTPException(status_code=500, detail="Could not allocate a username, try again")

    user = User(username=username, password_hash=hash_password(payload.password))
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(user.id)
    return TokenResponse(access_token=token, username=user.username)


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, request: Request, db: Session = Depends(get_db)):
    client_ip = request.client.host if request.client else "unknown"
    # Keyed by IP, not username: keying by username would let an attacker
    # learn which usernames exist by watching which keys get rate-limited.
    if not check_rate_limit(f"login:{client_ip}", settings.rate_limit_logins_per_min_per_ip, 60):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many login attempts from this network. Try again shortly.",
        )

    user = db.query(User).filter(User.username == payload.username).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    if user.is_banned:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account banned")

    token = create_access_token(user.id)
    return TokenResponse(access_token=token, username=user.username)
