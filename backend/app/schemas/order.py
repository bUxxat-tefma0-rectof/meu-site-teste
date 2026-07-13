from pydantic import BaseModel
from typing import List
from datetime import datetime


class CartItem(BaseModel):
    product_id: int
    quantity: int


class CheckoutRequest(BaseModel):
    items: List[CartItem]
    coupon_code: str | None = None
    payment_method: str


class OrderItemResponse(BaseModel):
    product_id: int
    quantity: int
    unit_price: float

    class Config:
        from_attributes = True


class OrderResponse(BaseModel):
    id: int
    total: float
    status: str
    payment_method: str | None
    items: List[OrderItemResponse]
    created_at: datetime

    class Config:
        from_attributes = True
