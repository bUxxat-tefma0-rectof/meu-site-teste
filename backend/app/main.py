from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.models import user, verification, category, product, order, coupon

Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Meu Site API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {"status": "API funcionando"}


from app.routers import auth, password, products, orders, admin

app.include_router(auth.router, prefix="/auth", tags=["Autenticação"])
app.include_router(password.router, prefix="/auth", tags=["Recuperação de Senha"])
app.include_router(products.router, prefix="/products", tags=["Produtos"])
app.include_router(orders.router, prefix="/orders", tags=["Pedidos"])
app.include_router(admin.router, prefix="/admin", tags=["Administração"])
