import io
import os
import uuid

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from PIL import Image, UnidentifiedImageError
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.config import settings
from app.database import get_db
from app.models import MediaAsset, User
from app.schemas import MediaAssetOut
from app.services.rate_limit import enforce_rate_limit

router = APIRouter(prefix="/media", tags=["media"])

ACCEPTED_FORMATS = {"PNG": "png", "JPEG": "jpg", "WEBP": "webp"}


def _ensure_upload_dir() -> str:
    os.makedirs(settings.upload_dir, exist_ok=True)
    return settings.upload_dir


def _save(img: Image.Image, fmt: str, path: str, quality: int = 85) -> int:
    save_kwargs = {"quality": quality, "optimize": True} if fmt in ("JPEG", "WEBP") else {"optimize": True}
    if fmt == "JPEG" and img.mode in ("RGBA", "P"):
        img = img.convert("RGB")
    img.save(path, format=fmt, **save_kwargs)
    return os.path.getsize(path)


@router.post("/image", response_model=MediaAssetOut)
def upload_image(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    enforce_rate_limit(
        f"upload:{current_user.id}", settings.rate_limit_uploads_per_min, 60, "uploading images"
    )

    raw = file.file.read()
    if len(raw) > 20 * 1024 * 1024:  # hard ceiling before we even try to decode
        raise HTTPException(status_code=413, detail="File too large")

    # Never trust the client's declared content-type: decode the actual
    # bytes. This both validates it's a real image and, because we re-encode
    # from the decoded pixel data below, strips anything smuggled in the
    # original file outside the image data itself.
    try:
        img = Image.open(io.BytesIO(raw))
        img.load()
    except UnidentifiedImageError:
        raise HTTPException(status_code=400, detail="File is not a valid image")

    if img.format not in ACCEPTED_FORMATS:
        raise HTTPException(status_code=400, detail="Only PNG, JPEG, and WEBP images are accepted")

    fmt = img.format
    ext = ACCEPTED_FORMATS[fmt]

    # Resize to the max long-edge dimension, preserving aspect ratio.
    w, h = img.size
    longest = max(w, h)
    if longest > settings.max_image_dimension:
        scale = settings.max_image_dimension / longest
        img = img.resize((max(1, int(w * scale)), max(1, int(h * scale))), Image.LANCZOS)

    upload_dir = _ensure_upload_dir()
    asset_id = str(uuid.uuid4())
    full_path = os.path.join(upload_dir, f"{asset_id}.{ext}")
    thumb_path = os.path.join(upload_dir, f"{asset_id}_thumb.{ext}")

    # Compress down under the size cap, stepping quality down if needed.
    quality = 88
    byte_size = _save(img, fmt, full_path, quality)
    while byte_size > settings.max_image_bytes and quality > 40 and fmt in ("JPEG", "WEBP"):
        quality -= 15
        byte_size = _save(img, fmt, full_path, quality)

    if byte_size > settings.max_image_bytes:
        os.remove(full_path)
        raise HTTPException(status_code=413, detail="Image is too large even after compression")

    thumb = img.copy()
    tw, th = thumb.size
    tlongest = max(tw, th)
    if tlongest > settings.thumbnail_dimension:
        scale = settings.thumbnail_dimension / tlongest
        thumb = thumb.resize((max(1, int(tw * scale)), max(1, int(th * scale))), Image.LANCZOS)
    _save(thumb, fmt, thumb_path, quality=80)

    asset = MediaAsset(
        id=asset_id,
        author_id=current_user.id,
        kind="image",
        url=f"/media/uploads/{asset_id}.{ext}",
        thumbnail_url=f"/media/uploads/{asset_id}_thumb.{ext}",
        width=img.width,
        height=img.height,
        byte_size=byte_size,
    )
    db.add(asset)
    db.commit()
    db.refresh(asset)
    return asset
