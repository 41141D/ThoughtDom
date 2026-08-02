from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth import get_current_user, get_current_user_optional
from app.config import settings
from app.database import get_db
from app.models import Community, Post, User
from app.schemas import PostCreate, PostOut
from app.services.rate_limit import enforce_rate_limit
from app.services.scoring import batch_my_votes, batch_scores, my_vote_for, score_for

router = APIRouter(prefix="/posts", tags=["posts"])


def _to_post_out(post: Post, score: int, my_vote: Optional[int]) -> PostOut:
    return PostOut(
        id=post.id,
        author_username=post.author.username,
        community_id=post.community_id,
        title=post.title,
        body=post.body,
        topics=post.topics,
        score=score,
        my_vote=my_vote,
        is_pinned=post.is_pinned,
        created_at=post.created_at,
    )


@router.get("/", response_model=List[PostOut])
def list_posts(
    community_id: str = None,
    db: Session = Depends(get_db),
    viewer: User | None = Depends(get_current_user_optional),
):
    query = db.query(Post)
    if community_id:
        query = query.filter(Post.community_id == community_id)
    posts = query.order_by(Post.created_at.desc()).limit(100).all()

    # One grouped query for every post's score, one for the viewer's votes,
    # instead of two queries per post (was O(n), now O(1) query count).
    ids = [p.id for p in posts]
    viewer_id = viewer.id if viewer else None
    scores = batch_scores(db, "post", ids)
    my_votes = batch_my_votes(db, "post", ids, viewer_id)

    return [_to_post_out(p, scores.get(p.id, 0), my_votes.get(p.id)) for p in posts]


@router.get("/{post_id}", response_model=PostOut)
def get_post(
    post_id: str,
    db: Session = Depends(get_db),
    viewer: User | None = Depends(get_current_user_optional),
):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    viewer_id = viewer.id if viewer else None
    return _to_post_out(post, score_for(db, "post", post.id), my_vote_for(db, "post", post.id, viewer_id))


@router.post("/", response_model=PostOut)
def create_post(
    payload: PostCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    enforce_rate_limit(
        f"post:{current_user.id}", settings.rate_limit_posts_per_min, 60, "creating posts"
    )

    community = db.query(Community).filter(Community.id == payload.community_id).first()
    if not community:
        raise HTTPException(status_code=404, detail="Community not found")

    normalized_topics = None
    if payload.topics:
        parts = [t.strip() for t in payload.topics.split(",") if t.strip()]
        if parts:
            normalized_topics = ", ".join(parts[:6])  # cap so one post can't flood the topic list

    post = Post(
        author_id=current_user.id,
        topics=normalized_topics,
        community_id=payload.community_id,
        title=payload.title,
        body=payload.body,
        forked_from_post_id=payload.forked_from_post_id,
    )
    db.add(post)
    db.commit()
    db.refresh(post)
    return _to_post_out(post, 0, None)  # brand new post: no votes exist yet, skip the query entirely
