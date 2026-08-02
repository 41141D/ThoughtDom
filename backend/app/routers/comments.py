from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth import get_current_user, get_current_user_optional
from app.config import settings
from app.database import get_db
from app.models import Comment, Post, User
from app.schemas import CommentCreate, CommentOut
from app.services.rate_limit import enforce_rate_limit
from app.services.scoring import batch_my_votes, batch_scores
from app.services.steelman import passes_steelman_check

router = APIRouter(prefix="/comments", tags=["comments"])


def _to_comment_out(comment: Comment, score: int, my_vote: Optional[int]) -> CommentOut:
    return CommentOut(
        id=comment.id,
        post_id=comment.post_id,
        parent_comment_id=comment.parent_comment_id,
        author_username=comment.author.username,
        reply_type=comment.reply_type,
        steelman_text=comment.steelman_text,
        steelman_passed=comment.steelman_passed,
        body=comment.body,
        score=score,
        my_vote=my_vote,
        created_at=comment.created_at,
    )


@router.get("/post/{post_id}", response_model=List[CommentOut])
def list_comments(
    post_id: str,
    db: Session = Depends(get_db),
    viewer: User | None = Depends(get_current_user_optional),
):
    comments = (
        db.query(Comment)
        .filter(Comment.post_id == post_id)
        .order_by(Comment.created_at.asc())
        .all()
    )
    ids = [c.id for c in comments]
    viewer_id = viewer.id if viewer else None
    scores = batch_scores(db, "comment", ids)
    my_votes = batch_my_votes(db, "comment", ids, viewer_id)
    return [_to_comment_out(c, scores.get(c.id, 0), my_votes.get(c.id)) for c in comments]


@router.post("/", response_model=CommentOut)
def create_comment(
    payload: CommentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    enforce_rate_limit(
        f"comment:{current_user.id}", settings.rate_limit_comments_per_min, 60, "commenting"
    )

    post = db.query(Post).filter(Post.id == payload.post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    steelman_passed = None
    if payload.reply_type == "challenge":
        # The Steel-Man Gate: what is being restated is either the parent
        # comment's body (if replying to a comment) or the post's body.
        if payload.parent_comment_id:
            parent = db.query(Comment).filter(Comment.id == payload.parent_comment_id).first()
            if not parent:
                raise HTTPException(status_code=404, detail="Parent comment not found")
            original_text = parent.body
        else:
            original_text = f"{post.title}\n{post.body}"

        passed, score = passes_steelman_check(
            original_text, payload.steelman_text or "", settings.steelman_min_similarity
        )
        steelman_passed = passed

        current_user.good_faith_attempts = (current_user.good_faith_attempts or 0) + 1
        if passed:
            current_user.good_faith_score = (current_user.good_faith_score or 0) + 1
        else:
            raise HTTPException(
                status_code=422,
                detail=(
                    "Your restatement doesn't look like a fair summary of the argument "
                    "you're challenging (similarity score: {:.2f}). Try again -- "
                    "restate their point the way they'd recognize it, before disagreeing."
                ).format(score),
            )

    comment = Comment(
        post_id=payload.post_id,
        parent_comment_id=payload.parent_comment_id,
        author_id=current_user.id,
        reply_type=payload.reply_type,
        steelman_text=payload.steelman_text,
        steelman_passed=steelman_passed,
        body=payload.body,
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)
    return _to_comment_out(comment, 0, None)
