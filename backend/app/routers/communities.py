from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models import Community
from app.schemas import CommunityOut

router = APIRouter(prefix="/communities", tags=["communities"])


@router.get("/", response_model=List[CommunityOut])
def list_communities(db: Session = Depends(get_db)):
    return db.query(Community).all()
