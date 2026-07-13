from pydantic import BaseModel
from typing import Optional, List, Dict, Any


class SiteContentSchema(BaseModel):
    hero_slides: List[Dict[str, Any]] = []
    about_text: str = ""
    differentials: List[Dict[str, Any]] = []
    testimonials: List[Dict[str, Any]] = []
    faq: List[Dict[str, Any]] = []
    payment_methods: List[str] = []
    delivery_policy: str = ""
    whatsapp_number: str = ""
    instagram_url: str = ""
    facebook_url: str = ""
    footer_address: str = ""
    footer_cnpj: str = ""

    class Config:
        from_attributes = True
