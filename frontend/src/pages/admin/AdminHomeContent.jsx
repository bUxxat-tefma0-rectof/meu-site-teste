import { useEffect, useState } from 'react'
import { getSiteContent, updateSiteContent } from '../../services/siteContent'

export default function AdminHomeContent() {
  const [content, setContent] = useState(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    getSiteContent().then(setContent)
  }, [])

  if (!content) return <p>Carregando...</p>

  function updateField(field, value) {
    setContent({ ...content, [field]: value })
  }

  function updateListItem(field, index, key, value) {
    const list = [...content[field]]
    list[index] = { ...list[index], [key]: value }
    updateField(field, list)
  }

  function addListItem(field, template) {
    updateField(field, [...content[field], template])
  }

  function removeListItem(field, index) {
    const list = [...content[field]]
    list.splice(index, 1)
    updateField(field, list)
  }

  async function handleSave() {
    await updateSiteContent(content)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div style={{ maxWidth: '700px' }}>
      <h2>Conteúdo da Home</h2>

      <section className="admin-section">
        <h3>Sobre a Empresa</h3>
        <textarea rows={4} value={content.about_text} onChange={(e) => updateField('about_text', e.target.value)} style={{ width: '100%' }} />
      </section>

      <section className="admin-section">
        <h3>Diferenciais</h3>
        {content.differentials.map((d, i) => (
          <div key={i} className="admin-list-item">
            <input placeholder="Título" value={d.title || ''} onChange={(e) => updateListItem('differentials', i, 'title', e.target.value)} />
            <input placeholder="Texto" value={d.text || ''} onChange={(e) => updateListItem('differentials', i, 'text', e.target.value)} />
            <button onClick={() => removeListItem('differentials', i)}>Remover</button>
          </div>
        ))}
        <button onClick={() => addListItem('differentials', { title: '', text: '' })}>+ Adicionar Diferencial</button>
      </section>

      <section className="admin-section">
        <h3>Depoimentos</h3>
        {content.testimonials.map((t, i) => (
          <div key={i} className="admin-list-item">
            <input placeholder="Nome do cliente" value={t.name || ''} onChange={(e) => updateListItem('testimonials', i, 'name', e.target.value)} />
            <input placeholder="Depoimento" value={t.text || ''} onChange={(e) => updateListItem('testimonials', i, 'text', e.target.value)} />
            <button onClick={() => removeListItem('testimonials', i)}>Remover</button>
          </div>
        ))}
        <button onClick={() => addListItem('testimonials', { name: '', text: '' })}>+ Adicionar Depoimento</button>
      </section>

      <section className="admin-section">
        <h3>FAQ</h3>
        {content.faq.map((f, i) => (
          <div key={i} className="admin-list-item">
            <input placeholder="Pergunta" value={f.question || ''} onChange={(e) => updateListItem('faq', i, 'question', e.target.value)} />
            <input placeholder="Resposta" value={f.answer || ''} onChange={(e) => updateListItem('faq', i, 'answer', e.target.value)} />
            <button onClick={() => removeListItem('faq', i)}>Remover</button>
          </div>
        ))}
        <button onClick={() => addListItem('faq', { question: '', answer: '' })}>+ Adicionar Pergunta</button>
      </section>

      <section className="admin-section">
        <h3>Contato e Redes Sociais</h3>
        <input placeholder="WhatsApp (ex: 5511999999999)" value={content.whatsapp_number} onChange={(e) => updateField('whatsapp_number', e.target.value)} style={{ width: '100%', marginBottom: '0.5rem' }} />
        <input placeholder="Link do Instagram" value={content.instagram_url} onChange={(e) => updateField('instagram_url', e.target.value)} style={{ width: '100%', marginBottom: '0.5rem' }} />
        <input placeholder="Link do Facebook" value={content.facebook_url} onChange={(e) => updateField('facebook_url', e.target.value)} style={{ width: '100%' }} />
      </section>

      <section className="admin-section">
        <h3>Rodapé</h3>
        <input placeholder="Endereço" value={content.footer_address} onChange={(e) => updateField('footer_address', e.target.value)} style={{ width: '100%', marginBottom: '0.5rem' }} />
        <input placeholder="CNPJ" value={content.footer_cnpj} onChange={(e) => updateField('footer_cnpj', e.target.value)} style={{ width: '100%' }} />
      </section>

      <section className="admin-section">
        <h3>Política de Entrega e Troca</h3>
        <textarea rows={3} value={content.delivery_policy} onChange={(e) => updateField('delivery_policy', e.target.value)} style={{ width: '100%' }} />
      </section>

      <button className="btn-accent" onClick={handleSave} style={{ marginTop: '1rem' }}>Salvar Alterações</button>
      {saved && <span style={{ marginLeft: '1rem', color: 'var(--color-success)' }}>Salvo!</span>}
    </div>
  )
}
