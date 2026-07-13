import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getProduct } from '../services/products'

export default function ProductDetail() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)

  useEffect(() => {
    getProduct(id).then(setProduct)
  }, [id])

  if (!product) return <p style={{ padding: '2rem' }}>Carregando...</p>

  function addToCart() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    cart.push({ product_id: product.id, quantity: 1 })
    localStorage.setItem('cart', JSON.stringify(cart))
    alert('Adicionado ao carrinho!')
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h2>{product.name}</h2>
      <p>{product.description}</p>
      <p><strong>R$ {(product.promotional_price || product.price).toFixed(2)}</strong></p>
      <button onClick={addToCart}>Adicionar ao carrinho</button>
    </div>
  )
}
