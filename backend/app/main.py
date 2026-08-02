import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.database import Base, engine, SessionLocal
from app.models import Community
from app.routers import auth, communities, posts, comments, votes, users, media

app = FastAPI(title="ThoughtDom API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000","https://your-vercel-domain.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(communities.router)
app.include_router(posts.router)
app.include_router(comments.router)
app.include_router(votes.router)
app.include_router(users.router)
app.include_router(media.router)


@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)
    os.makedirs(settings.upload_dir, exist_ok=True)
    app.mount("/media/uploads", StaticFiles(directory=settings.upload_dir), name="uploads")
    # Seed one default community so the MVP has somewhere to post on first run.
    # See the roadmap doc, Phase 0: launch into a single niche community, not broad.
    db = SessionLocal()
    try:
        if not db.query(Community).first():
            db.add(Community(name="general", description="The first ThoughtDom community. Start here."))
            db.commit()
    finally:
        db.close()


@app.get("/health")
def health():
    return {"status": "ok"}
