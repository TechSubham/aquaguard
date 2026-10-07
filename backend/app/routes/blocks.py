from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.block import Block
from app.models.hostel import Hostel
from app.models.user import User
from app.services.auth_service import require_roles

router = APIRouter(prefix="/blocks", tags=["Blocks"])


class BlockCreate(BaseModel):
    hostel_id: int
    name: str


class BlockUpdate(BaseModel):
    name: Optional[str] = None
    hostel_id: Optional[int] = None


def format_block(block: Block) -> dict:
    return {
        "id": block.id,
        "name": block.name,
        "hostel_id": block.hostel_id,
        "hostel_name": block.hostel.name if block.hostel else None,
        "tanks": [
            {"id": t.id, "tank_code": t.tank_code, "capacity_liters": float(t.capacity_liters or 0)}
            for t in (block.tanks or [])
        ],
        "created_at": block.created_at.isoformat() if block.created_at else None
    }


@router.get("/")
def get_blocks(hostel_id: Optional[int] = None, db: Session = Depends(get_db)):
    query = db.query(Block)
    if hostel_id:
        query = query.filter(Block.hostel_id == hostel_id)
    blocks = query.all()
    return [format_block(b) for b in blocks]


@router.get("/{block_id}")
def get_block(block_id: int, db: Session = Depends(get_db)):
    block = db.query(Block).filter(Block.id == block_id).first()
    if not block:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Block with ID {block_id} not found"
        )
    return format_block(block)


@router.post("/", status_code=status.HTTP_201_CREATED)
def create_block(
    req: BlockCreate,
    current_user: User = Depends(require_roles(["admin"])),
    db: Session = Depends(get_db)
):
    hostel = db.query(Hostel).filter(Hostel.id == req.hostel_id).first()
    if not hostel:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Hostel ID {req.hostel_id} does not exist"
        )

    block = Block(hostel_id=req.hostel_id, name=req.name)
    db.add(block)
    db.commit()
    db.refresh(block)
    return format_block(block)


@router.patch("/{block_id}")
def update_block(
    block_id: int,
    req: BlockUpdate,
    current_user: User = Depends(require_roles(["admin"])),
    db: Session = Depends(get_db)
):
    block = db.query(Block).filter(Block.id == block_id).first()
    if not block:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Block with ID {block_id} not found"
        )

    if req.name is not None:
        block.name = req.name
    if req.hostel_id is not None:
        hostel = db.query(Hostel).filter(Hostel.id == req.hostel_id).first()
        if not hostel:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Hostel ID {req.hostel_id} does not exist"
            )
        block.hostel_id = req.hostel_id

    db.commit()
    db.refresh(block)
    return format_block(block)
