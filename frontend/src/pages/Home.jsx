import Carousel from '../components/Carousel'

const slides = [
  {
    eyebrow: 'Novidade',
    title: 'Bem-vindo ao Meu Site',
    subtitle: 'Os melhores produtos com entrega rápida e segura.',
    ctaText: 'Ver Produtos',
    background: 'linear-gradient(135deg, #1B3A6B, #122747)',
  },
  {
    eyebrow: 'Promoção',
    title: 'Ofertas da Semana',
    subtitle: 'Descontos exclusivos por tempo limitado.',
    ctaText: 'Aproveitar',
    background: 'linear-gradient(135deg, #2E9E6D, #1B3A6B)',
  },
  {
    eyebrow: 'Confiança',
    title: 'Pagamento Seguro',
    subtitle: 'PIX, cartão e boleto com total segurança.',
    ctaText: 'Saiba Mais',
    background: 'linear-gradient(135deg, #D68F1F, #1B3A6B)',
  },
]

export default function Home() {
  return (
    <div className="container" style={{ padding: '2rem 1.5rem' }}>
      <Carousel slides={slides} />
    </div>
  )
}
