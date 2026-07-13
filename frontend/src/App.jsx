import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import VerifyEmail from './pages/VerifyEmail'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import MyOrders from './pages/MyOrders'

export default function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Register />} />
        <Route path="/verificar-email" element={<VerifyEmail />} />
        <Route path="/esqueci-senha" element={<ForgotPassword />} />
        <Route path="/redefinir-senha" element={<ResetPassword />} />
        <Route path="/produtos" element={<Products />} />
        <Route path="/produtos/:id" element={<ProductDetail />} />
        <Route path="/carrinho" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/meus-pedidos" element={<MyOrders />} />
      </Routes>
    </BrowserRouter>
  )
}
