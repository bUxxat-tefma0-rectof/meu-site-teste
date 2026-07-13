from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.product import Product
from app.models.order import Order, OrderItem
from app.models.coupon import Coupon
from app.models.user import User
from app.schemas.order import CheckoutRequest, OrderResponse
from app.utils.auth_dependency import get_current_user
from app.utils.email import send_email

router = APIRouter()


@router.post("/checkout", response_model=OrderResponse)
def checkout(
    data: CheckoutRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    total = 0.0
    order_items_data = []

    for item in data.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail=f"Produto {item.product_id} não encontrado")

        if product.stock < item.quantity:
            raise HTTPException(status_code=400, detail=f"Estoque insuficiente para {product.name}")

        unit_price = product.promotional_price or product.price
        total += unit_price * item.quantity

        order_items_data.append({
            "product_id": product.id,
            "quantity": item.quantity,
            "unit_price": unit_price,
        })

        product.stock -= item.quantity

    if data.coupon_code:
        coupon = db.query(Coupon).filter(
            Coupon.code == data.coupon_code, Coupon.is_active == True
        ).first()

        if not coupon:
            raise HTTPException(status_code=400, detail="Cupom inválido")

        if coupon.max_uses and coupon.used_count >= coupon.max_uses:
            raise HTTPException(status_code=400, detail="Cupom esgotado")

        if coupon.discount_percent:
            total -= total * (coupon.discount_percent / 100)
        elif coupon.discount_value:
            total -= coupon.discount_value

        coupon.used_count += 1

    new_order = Order(
        user_id=current_user.id,
        total=round(total, 2),
        payment_method=data.payment_method,
    )
    db.add(new_order)
    db.commit()
    db.refresh(new_order)

    for item_data in order_items_data:
        order_item = OrderItem(order_id=new_order.id, **item_data)
        db.add(order_item)

    db.commit()
    db.refresh(new_order)

    send_email(
        current_user.email,
        "Confirmação de pedido",
        f"<p>Seu pedido #{new_order.id} foi recebido! Total: R$ {new_order.total:.2f}</p>",
    )

    return new_order


@router.get("/my-orders", response_model=list[OrderResponse])
def my_orders(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return db.query(Order).filter(Order.user_id == current_user.id).all()
