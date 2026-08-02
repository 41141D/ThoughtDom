from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


# ---- Auth ----

class RegisterRequest(BaseModel):
    password: str = Field(min_length=8)
    preferred_username: Optional[str] = None  # if taken, a random one is generated instead


class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    username: str


# ---- Community ----

class CommunityOut(BaseModel):
    id: str
    name: str
    description: str

    class Config:
        from_attributes = True


# ---- Posts ----

class PostCreate(BaseModel):
    community_id: str
    title: str = Field(min_length=1, max_length=300)
    body: str = Field(min_length=1)
    topics: Optional[str] = Field(default=None, max_length=300)
    forked_from_post_id: Optional[str] = None


class PostOut(BaseModel):
    id: str
    author_username: str
    community_id: str
    title: str
    body: str
    topics: Optional[str] = None
    score: int
    my_vote: Optional[int] = None
    is_pinned: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ---- Comments ----

class CommentCreate(BaseModel):
    post_id: str
    parent_comment_id: Optional[str] = None
    reply_type: str = Field(default="neutral", pattern="^(neutral|agree|challenge)$")
    steelman_text: Optional[str] = None
    body: str = Field(min_length=1)


class CommentOut(BaseModel):
    id: str
    post_id: str
    parent_comment_id: Optional[str]
    author_username: str
    reply_type: str
    steelman_text: Optional[str]
    steelman_passed: Optional[bool]
    body: str
    score: int
    my_vote: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True


# ---- Votes ----

class VoteRequest(BaseModel):
    target_type: str = Field(pattern="^(post|comment)$")
    target_id: str
    value: int = Field(ge=-1, le=1)


# ---- Reports ----

class ReportCreate(BaseModel):
    target_type: str = Field(pattern="^(post|comment)$")
    target_id: str
    reason: str = Field(min_length=1, max_length=2000)


# ---- Media ----

class MediaAssetOut(BaseModel):
    id: str
    kind: str
    url: str
    thumbnail_url: Optional[str]
    width: Optional[int]
    height: Optional[int]
    byte_size: int

    class Config:
        from_attributes = True


# ---- Profiles ----

class TopicStat(BaseModel):
    topic: str
    count: int
    weight: float  # 0..1, relative to this user's most-discussed topic


class ActivityItem(BaseModel):
    type: str  # "post" | "comment"
    id: str
    post_id: str
    title: Optional[str] = None  # posts only
    excerpt: str
    score: int
    created_at: datetime


class Milestone(BaseModel):
    label: str
    date: Optional[datetime] = None  # None for undated reputation milestones


class UserProfileOut(BaseModel):
    username: str
    joined_at: datetime
    reputation: int
    helpful_posts: int
    helpful_comments: int
    communities: list[str]
    topics: list[TopicStat]
    recent_activity: list[ActivityItem]
    timeline: list[Milestone]
    reputation_milestones: list[Milestone]
