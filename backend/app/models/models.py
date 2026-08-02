import uuid
from datetime import datetime, timezone

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    SmallInteger,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship

from app.database import Base


def gen_uuid():
    return str(uuid.uuid4())


def now():
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=gen_uuid)
    username = Column(String(32), unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)
    reputation_score = Column(Integer, default=0)
    good_faith_score = Column(Integer, default=0)  # Steel-Man Gate reputation
    good_faith_attempts = Column(Integer, default=0)
    warnings_count = Column(Integer, default=0)
    is_banned = Column(Boolean, default=False)
    created_at = Column(DateTime, default=now)

    posts = relationship("Post", back_populates="author")
    comments = relationship("Comment", back_populates="author")


class Community(Base):
    __tablename__ = "communities"

    id = Column(String, primary_key=True, default=gen_uuid)
    name = Column(String(64), unique=True, nullable=False)
    description = Column(Text, default="")
    created_at = Column(DateTime, default=now)

    posts = relationship("Post", back_populates="community")


class Post(Base):
    __tablename__ = "posts"

    id = Column(String, primary_key=True, default=gen_uuid)
    author_id = Column(String, ForeignKey("users.id"), nullable=False)
    community_id = Column(String, ForeignKey("communities.id"), nullable=False)
    forked_from_post_id = Column(String, ForeignKey("posts.id"), nullable=True)
    title = Column(String(300), nullable=False)
    body = Column(Text, nullable=False)
    # Free-text, comma-separated topics the author tags their own post with
    # (e.g. "artificial intelligence, biology"). Deliberately not a separate
    # table yet -- this is a minimal seed so profile Curiosity Maps have real
    # data, not a full taxonomy. Upgrade path: normalize into a Tag model
    # + join table once tagging becomes a first-class feature.
    topics = Column(String(300), nullable=True)
    is_pinned = Column(Boolean, default=False)
    is_edited = Column(Boolean, default=False)
    created_at = Column(DateTime, default=now)
    updated_at = Column(DateTime, nullable=True)

    author = relationship("User", back_populates="posts")
    community = relationship("Community", back_populates="posts")
    comments = relationship("Comment", back_populates="post", cascade="all, delete-orphan")


class Comment(Base):
    __tablename__ = "comments"

    id = Column(String, primary_key=True, default=gen_uuid)
    post_id = Column(String, ForeignKey("posts.id"), nullable=False)
    parent_comment_id = Column(String, ForeignKey("comments.id"), nullable=True)
    author_id = Column(String, ForeignKey("users.id"), nullable=False)

    # neutral | agree | challenge
    reply_type = Column(String(16), default="neutral")
    # Required when reply_type == "challenge" -- the Steel-Man Gate text.
    steelman_text = Column(Text, nullable=True)
    steelman_passed = Column(Boolean, nullable=True)

    body = Column(Text, nullable=False)
    created_at = Column(DateTime, default=now)

    post = relationship("Post", back_populates="comments")
    author = relationship("User", back_populates="comments")


class Vote(Base):
    __tablename__ = "votes"
    __table_args__ = (UniqueConstraint("user_id", "target_type", "target_id", name="uq_vote"),)

    id = Column(String, primary_key=True, default=gen_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    target_type = Column(String(16), nullable=False)  # post | comment
    target_id = Column(String, nullable=False)
    value = Column(SmallInteger, nullable=False)  # -1 or 1
    created_at = Column(DateTime, default=now)


class Report(Base):
    __tablename__ = "reports"

    id = Column(String, primary_key=True, default=gen_uuid)
    reporter_id = Column(String, ForeignKey("users.id"), nullable=False)
    target_type = Column(String(16), nullable=False)
    target_id = Column(String, nullable=False)
    reason = Column(Text, nullable=False)
    status = Column(String(16), default="pending")  # pending | reviewed | dismissed
    created_at = Column(DateTime, default=now)


class MediaAsset(Base):
    """An uploaded file, independent of any post. Images are inserted into a
    post's markdown body as ![](url) at upload time, so a post can reference
    zero, one, or many assets without a join table.

    `kind` is "image" for everything today. Adding video later means adding
    accepted mimetypes and a transcode step in the upload endpoint -- this
    table and the URL-embed pattern don't need to change.
    """

    __tablename__ = "media_assets"

    id = Column(String, primary_key=True, default=gen_uuid)
    author_id = Column(String, ForeignKey("users.id"), nullable=False)
    kind = Column(String(20), nullable=False, default="image")
    url = Column(String, nullable=False)
    thumbnail_url = Column(String, nullable=True)
    width = Column(Integer, nullable=True)
    height = Column(Integer, nullable=True)
    byte_size = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=now)
