import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getSiteContent } from '../services/siteContent'

export default function Footer() {
  const [content, setContent] = useState(null)
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  useEffect(() => {
    getSiteContent().then(setContent)
  }, [])

  function handleNewsletter(e) {
    e.preventDefault()
    setSubscribed(true)
    setEmail('')
  }

  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-col">
          <h4>Meu Site</h4>
          <p className="footer-muted">{content?.footer_address || 'Endereço não cadastrado'}</p>
          {content?.footer_cnpj && <p className="footer-muted">CNPJ: {content.footer_cnpj}</p>}
        </div>

        <div className="footer-col">
          <h4>Institucional</h4>
          <Link to="/produtos">Produtos</Link>
          <Link to="/termos">Termos de Uso</Link>
          <Link to="/privacidade">Política de Privacidade</Link>
        </div>

        <div className="footer-col">
          <h4>Redes Sociais</h4>
          <div className="footer-socials">
            {content?.instagram_url && <a href={content.instagram_url} target="_blank" rel="noreferrer">Instagram</a>}
            {content?.facebook_url && <a href={content.facebook_url} target="_blank" rel="noreferrer">Facebook</a>}
            {content?.whatsapp_number && (
              <a href={`https://wa.me/${content.whatsapp_number}`} target="_blank" rel="noreferrer">WhatsApp</a>
            )}
          </div>
        </div>

        <div className="footer-col">
          <h4>Fique por dentro</h4>
          {subscribed ? (
            <p className="footer-muted">Inscrito com sucesso!</p>
          ) : (
            <form onSubmit={handleNewsletter} className="newsletter-form">
              <input type="email" placeholder="Seu e-mail" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <button type="submit" className="btn-accent">OK</button>
            </form>
          )}
        </div>
      </div>

      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Meu Site. Todos os direitos reservados.</span>
      </div>

      {content?.whatsapp_number && (
        <a
          href={`https://wa.me/${content.whatsapp_number}`}
          target="_blank"
          rel="noreferrer"
          className="whatsapp-float"
          aria-label="Falar no WhatsApp"
        >
          WhatsApp
        </a>
      )}
    </footer>
  )
}
