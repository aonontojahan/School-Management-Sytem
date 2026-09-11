from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, require_admin
from app.db.session import get_db
from app.models.people import GuardianProfile
from app.schemas.people import GuardianCreate, GuardianOut, GuardianUpdate

router = APIRouter(prefix="/guardians", tags=["guardians"])


@router.get("", response_model=list[GuardianOut])
def list_guardians(db: Session = Depends(get_db), user=Depends(get_current_user)):
    return db.query(GuardianProfile).order_by(GuardianProfile.id).all()


@router.post("", response_model=GuardianOut, status_code=201, dependencies=[Depends(require_admin)])
def create_guardian(data: GuardianCreate, db: Session = Depends(get_db)):
    g = GuardianProfile(**data.model_dump())
    db.add(g)
    db.commit()
    db.refresh(g)
    return g


@router.get("/{guardian_id}", response_model=GuardianOut)
def get_guardian(guardian_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    g = db.get(GuardianProfile, guardian_id)
    if not g:
        raise HTTPException(404, "Guardian not found")
    return g


@router.patch("/{guardian_id}", response_model=GuardianOut, dependencies=[Depends(require_admin)])
def update_guardian(guardian_id: int, data: GuardianUpdate, db: Session = Depends(get_db)):
    g = db.get(GuardianProfile, guardian_id)
    if not g:
        raise HTTPException(404, "Guardian not found")
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(g, k, v)
    db.commit()
    db.refresh(g)
    return g
