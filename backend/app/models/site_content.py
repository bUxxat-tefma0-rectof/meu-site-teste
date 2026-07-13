from sqlalchemy import Column, Integer, String, Text, Boolean, JSON
from app.database import Base


class SiteContent(Base):
    __tablename__ = "site_content"

    id = Column(Integer, primary_key=True, index=True)

    hero_slides = Column(JSON, default=list)
    about_text = Column(Text, default="")
    differentials = Column(JSON, default=list)
    testimonials = Column(JSON, default=list)
    faq = Column(JSON, default=list)
    payment_methods = Column(JSON, default=list)
    delivery_policy = Column(Text, default="")
    whatsapp_number = Column(String, default="")
    instagram_url = Column(String, default="")
    facebook_url = Column(String, default="")
    footer_address = Column(String, default="")
    footer_cnpj = Column(String, default="")
