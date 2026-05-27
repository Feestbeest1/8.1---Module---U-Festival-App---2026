import { useState } from 'react'
import { festivalData } from '../data/festival.js'
import './Info.css'

const labels = {
  nl: { title: "FESTIVAL", heading: "INFORMATIE" },
  en: { title: "FESTIVAL", heading: "INFORMATION" },
  fr: { title: "FESTIVAL", heading: "INFORMATIONS" },
  de: { title: "FESTIVAL", heading: "INFORMATIONEN" },
}

function Accordion({ title, children }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={`accordion ${open ? 'open' : ''}`}>
      <button className="accordion-trigger" onClick={() => setOpen(!open)}>
        <span>{title}</span>
        <span className="material-icons accordion-icon">{open ? 'expand_less' : 'expand_more'}</span>
      </button>
      {open && <div className="accordion-content">{children}</div>}
    </div>
  )
}

export default function Info({ language }) {
  const lang = labels[language] || labels.nl
  const data = festivalData[language]?.info || festivalData.nl.info

  return (
    <div className="page">
      <p className="page-title">{lang.title}</p>
      <h1 className="page-heading">{lang.heading}</h1>

      {/* Op desktop: grid met 2 kolommen */}
      <div className="info-grid">
        <Accordion title={data.general.title}>
          <p className="info-text">{data.general.content}</p>
        </Accordion>

        <Accordion title={data.accessibility.title}>
          {data.accessibility.sections.map((s, i) => (
            <div key={i} className="info-section">
              <h4 className="info-subheading">{s.heading}</h4>
              <p className="info-text">{s.text}</p>
            </div>
          ))}
        </Accordion>

        <Accordion title={data.lockers.title}>
          <p className="info-text">{data.lockers.content}</p>
        </Accordion>

        <Accordion title={data.faq.title}>
          {data.faq.items.map((item, i) => (
            <div key={i} className="faq-item">
              <p className="faq-q">{item.q}</p>
              <p className="faq-a">{item.a}</p>
            </div>
          ))}
        </Accordion>

        <Accordion title={data.golden.title}>
          <div className="golden-badge">
            <span className="material-icons">star</span>
            <span>GLU Golden Privilege</span>
          </div>
          <p className="info-text">{data.golden.content}</p>
        </Accordion>
      </div>
    </div>
  )
}
