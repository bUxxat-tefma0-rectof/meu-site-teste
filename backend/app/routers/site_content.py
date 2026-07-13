from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.site_content import SiteContent
from app.models.user import User
from app.schemas.site_content import SiteContentSchema
from app.utils.admin_dependency import get_current_admin

router = APIRouter()


def get_or_create_content(db: Session) -> SiteContent:
    content = db.query(SiteContent).filter(SiteContent.id == 1).first()
    if not content:
        content = SiteContent(id=1)
        db.add(content)
        db.commit()
        db.refresh(content)
    return content


@router.get("/", response_model=SiteContentSchema)
def get_site_content(db: Session = Depends(get_db)):
    return get_or_create_content(db)


@router.put("/", response_model=SiteContentSchema)
def update_site_content(
    data: SiteContentSchema,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    content = get_or_create_content(db)
    for field, value in data.dict().items():
        setattr(content, field, value)
    db.commit()
    db.refresh(content)
    return content
