import { useState, useEffect, useCallback } from 'react'

export default function Carousel({ slides }) {
  const [current, setCurrent] = useState(0)

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % slides.length)
  }, [slides.length])

  const prev = () => {
    setCurrent((c) => (c - 1 + slides.length) % slides.length)
  }

  useEffect(() => {
    const timer = setInterval(next, 5000)
    return () => clearInterval(timer)
  }, [next])

  if (!slides || slides.length === 0) return null

  return (
    <div className="carousel">
      <div className="carousel-track">
        {slides.map((slide, index) => (
          <div
            key={index}
            className="carousel-slide"
            style={{
              opacity: index === current ? 1 : 0,
              zIndex: index === current ? 1 : 0,
              background: slide.background,
            }}
          >
            <div className="carousel-content">
              <span className="carousel-eyebrow">{slide.eyebrow}</span>
              <h2>{slide.title}</h2>
              <p>{slide.subtitle}</p>
              {slide.ctaText && <button className="btn-accent">{slide.ctaText}</button>}
            </div>
          </div>
        ))}
      </div>

      <button className="carousel-arrow carousel-arrow-left" onClick={prev} aria-label="Anterior">‹</button>
      <button className="carousel-arrow carousel-arrow-right" onClick={next} aria-label="Próximo">›</button>

      <div className="carousel-dots">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`carousel-dot ${index === current ? 'active' : ''}`}
            onClick={() => setCurrent(index)}
            aria-label={`Ir para slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
