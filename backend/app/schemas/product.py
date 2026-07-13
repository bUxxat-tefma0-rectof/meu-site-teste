from pydantic import BaseModel
from typing import Optional


class CategoryResponse(BaseModel):
    id: int
    name: str
    slug: str

    class Config:
        from_attributes = True


class ProductCreate(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None
    specifications: Optional[str] = None
    price: float
    promotional_price: Optional[float] = None
    stock: int = 0
    category_id: Optional[int] = None
    main_image_url: Optional[str] = None


class ProductResponse(BaseModel):
    id: int
    name: str
    slug: str
    description: Optional[str]
    specifications: Optional[str]
    price: float
    promotional_price: Optional[float]
    stock: int
    category: Optional[CategoryResponse]
    main_image_url: Optional[str]

    class Config:
        from_attributes = True
