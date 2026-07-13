import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Carousel from '../components/Carousel'
import { getProducts } from '../services/products'
import { getSiteContent } from '../services/siteContent'
import api from '../services/api'

export default function Home() {
  const [content, setContent] = useState(null)
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [openFaq, setOpenFaq] = useState(null)

  useEffect(() => {
    getSiteContent().then(setContent)
    getProducts().then(setProducts)
    api.get('/admin/categories').then((res) => setCategories(res.data)).catch(() => setCategories([]))
  }, [])

  const slides = content?.hero_slides?.length
    ? content.hero_slides
    : [
        {
          eyebrow: 'Bem-vindo',
          title: 'Meu Site',
          subtitle: 'Os melhores produtos com entrega rápida e segura.',
          ctaText: 'Ver Produtos',
          background: 'linear-gradient(135deg, #1B3A6B, #122747)',
        },
      ]

  const featured = products.slice(0, 4)
  const newArrivals = [...products].reverse().slice(0, 4)
  const offers = products.filter((p) => p.promotional_price).slice(0, 4)

  return (
    <div>
      <div className="container" style={{ padding: '2rem 1.5rem 0' }}>
        <Carousel slides={slides} />
      </div>

      {categories.length > 0 && (
        <section className="container section">
          <h2 className="section-title">Categorias</h2>
          <div className="category-row">
            {categories.map((c) => (
              <Link key={c.id} to={`/produtos?category_id=${c.id}`} className="category-pill">
                {c.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {featured.length > 0 && (
        <section className="container section">
          <h2 className="section-title">Produtos em Destaque</h2>
          <ProductRow products={featured} />
        </section>
      )}

      {offers.length > 0 && (
        <section className="container section section-offers">
          <h2 className="section-title">Ofertas e Descontos</h2>
          <ProductRow products={offers} />
        </section>
      )}

      {newArrivals.length > 0 && (
        <section className="container section">
          <h2 className="section-title">Novidades</h2>
          <ProductRow products={newArrivals} />
        </section>
      )}

      {content?.about_text && (
        <section className="container section about-section">
          <h2 className="section-title">Sobre a Empresa</h2>
          <p className="about-text">{content.about_text}</p>
        </section>
      )}

      {content?.differentials?.length > 0 && (
        <section className="container section">
          <h2 className="section-title">Por que comprar conosco</h2>
          <div className="differentials-grid">
            {content.differentials.map((d, i) => (
              <div key={i} className="card differential-card">
                <h3>{d.title}</h3>
                <p>{d.text}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {content?.testimonials?.length > 0 && (
        <section className="container section testimonials-section">
          <h2 className="section-title">Depoimentos de Clientes</h2>
          <div className="testimonials-grid">
            {content.testimonials.map((t, i) => (
              <div key={i} className="card testimonial-card">
                <p className="testimonial-text">"{t.text}"</p>
                <span className="testimonial-name">{t.name}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {content?.payment_methods?.length > 0 && (
        <section className="container section">
          <h2 className="section-title">Formas de Pagamento</h2>
          <div className="payment-row">
            {content.payment_methods.map((p, i) => (
              <span key={i} className="payment-badge">{p}</span>
            ))}
          </div>
        </section>
      )}

      {content?.delivery_policy && (
        <section className="container section">
          <h2 className="section-title">Entrega e Trocas</h2>
          <p className="about-text">{content.delivery_policy}</p>
        </section>
      )}

      {content?.faq?.length > 0 && (
        <section className="container section">
          <h2 className="section-title">Perguntas Frequentes</h2>
          <div className="faq-list">
            {content.faq.map((f, i) => (
              <div key={i} className="faq-item" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                <div className="faq-question">
                  <span>{f.question}</span>
                  <span>{openFaq === i ? '−' : '+'}</span>
                </div>
                {openFaq === i && <p className="faq-answer">{f.answer}</p>}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function ProductRow({ products }) {
  return (
    <div className="product-grid">
      {products.map((p) => (
        <Link key={p.id} to={`/produtos/${p.id}`} className="card product-card">
          <div className="product-image-placeholder">
            {p.main_image_url ? <img src={p.main_image_url} alt={p.name} /> : <span>{p.name[0]}</span>}
          </div>
          <div className="product-card-body">
            <h3>{p.name}</h3>
            <span className="price-tag">{(p.promotional_price || p.price).toFixed(2)}</span>
          </div>
        </Link>
      ))}
    </div>
  )
}
