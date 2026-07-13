from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models.user import User
from app.models.product import Product
from app.models.order import Order, OrderStatus
from app.models.category import Category
from app.models.coupon import Coupon
from app.schemas.admin import DashboardStats, CategoryCreate, CouponCreate
from app.schemas.user import UserResponse
from app.utils.admin_dependency import get_current_admin

router = APIRouter()


@router.get("/dashboard", response_model=DashboardStats)
def dashboard(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    total_users = db.query(User).count()
    total_products = db.query(Product).count()
    total_orders = db.query(Order).count()
    total_revenue = db.query(func.sum(Order.total)).filter(
        Order.status == OrderStatus.paid
    ).scalar() or 0.0
    orders_pending = db.query(Order).filter(Order.status == OrderStatus.pending).count()

    return DashboardStats(
        total_users=total_users,
        total_products=total_products,
        total_orders=total_orders,
        total_revenue=total_revenue,
        orders_pending=orders_pending,
    )


@router.get("/users", response_model=list[UserResponse])
def list_users(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    return db.query(User).all()


@router.patch("/users/{user_id}/toggle-active")
def toggle_user_active(
    user_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")

    user.is_active = not user.is_active
    db.commit()
    return {"message": f"Usuário {'ativado' if user.is_active else 'desativado'}"}


@router.get("/orders")
def list_all_orders(
    status: str | None = None,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    query = db.query(Order)
    if status:
        query = query.filter(Order.status == status)
    return query.order_by(Order.created_at.desc()).all()


@router.patch("/orders/{order_id}/status")
def update_order_status(
    order_id: int,
    new_status: OrderStatus,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Pedido não encontrado")

    order.status = new_status
    db.commit()
    return {"message": f"Status atualizado para {new_status.value}"}


@router.post("/categories")
def create_category(
    data: CategoryCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    existing = db.query(Category).filter(Category.slug == data.slug).first()
    if existing:
        raise HTTPException(status_code=400, detail="Slug já existe")

    category = Category(**data.dict())
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


@router.get("/categories")
def list_categories(db: Session = Depends(get_db)):
    return db.query(Category).all()


@router.post("/coupons")
def create_coupon(
    data: CouponCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    existing = db.query(Coupon).filter(Coupon.code == data.code).first()
    if existing:
        raise HTTPException(status_code=400, detail="Cupom já existe")

    coupon = Coupon(**data.dict())
    db.add(coupon)
    db.commit()
    db.refresh(coupon)
    return coupon


@router.get("/coupons")
def list_coupons(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    return db.query(Coupon).all()
