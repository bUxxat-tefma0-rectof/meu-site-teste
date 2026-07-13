from pydantic import BaseModel
from typing import Optional


class DashboardStats(BaseModel):
    total_users: int
    total_products: int
    total_orders: int
    total_revenue: float
    orders_pending: int


class CategoryCreate(BaseModel):
    name: str
    slug: str
    parent_id: Optional[int] = None


class CouponCreate(BaseModel):
    code: str
    discount_percent: Optional[float] = None
    discount_value: Optional[float] = None
    max_uses: Optional[int] = None
