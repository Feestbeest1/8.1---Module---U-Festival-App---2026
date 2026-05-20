import { useEffect, useRef, useState, useCallback } from 'react'
import './Map.css'

const t = {
  nl: { title: "FESTIVALTERREIN", heading: "KAART", legend: "Legenda", close: "Sluiten",
        routeTo: "Route naar", clearRoute: "Route wissen", navigate: "Navigeer" },
  en: { title: "FESTIVAL GROUNDS", heading: "MAP", legend: "Legend", close: "Close",
        routeTo: "Route to", clearRoute: "Clear route", navigate: "Navigate" },
  fr: { title: "TERRAIN DU FESTIVAL", heading: "CARTE", legend: "Légende", close: "Fermer",
        routeTo: "Itinéraire vers", clearRoute: "Effacer", navigate: "Naviguer" },
  de: { title: "FESTIVALGELÄNDE", heading: "KARTE", legend: "Legende", close: "Schließen",
        routeTo: "Route nach", clearRoute: "Route löschen", navigate: "Navigieren" },
}

// Posities berekend vanuit de SVG viewBox (2330.58 × 1353.19)
// Elk getal = coördinaat / SVG-breedte of -hoogte
const markers = [
  {
    id: 'entrance', x: 0.690, y: 0.849,
    icon: 'login', color: '#4CAF50',
    label: { nl: 'Ingang / Uitgang', en: 'Entrance / Exit', fr: 'Entrée / Sortie', de: 'Eingang / Ausgang' },
    info:  { nl: 'Hoofdingang & uitgang van het festivalterrein', en: 'Main entrance & exit of the festival grounds', fr: 'Entrée et sortie principale', de: 'Haupteingang und Ausgang' },
  },
  {
    id: 'ponton', x: 0.213, y: 0.627,
    icon: 'music_note', color: '#F03228',
    label: { nl: 'Ponton', en: 'Ponton', fr: 'Ponton', de: 'Ponton' },
    info:  { nl: 'Main stage – Hoofdacts & headliners', en: 'Main stage – Headliners', fr: 'Scène principale – Têtes d\'affiche', de: 'Hauptbühne – Headliner' },
  },
  {
    id: 'lake', x: 0.539, y: 0.455,
    icon: 'water', color: '#247BA0',
    label: { nl: 'The Lake', en: 'The Lake', fr: 'Le Lac', de: 'Der See' },
    info:  { nl: 'Onbekend & opkomend talent', en: 'Unknown & upcoming talent', fr: 'Talent inconnu & émergent', de: 'Unbekannte & aufstrebende Talente' },
  },
  {
    id: 'club', x: 0.693, y: 0.391,
    icon: 'theater_comedy', color: '#E3B505',
    label: { nl: 'The Club', en: 'The Club', fr: 'Le Club', de: 'Der Club' },
    info:  { nl: 'Theater & Stand-up comedy', en: 'Theater & Stand-up comedy', fr: 'Théâtre & Stand-up', de: 'Theater & Comedy' },
  },
  {
    id: 'hangar', x: 0.902, y: 0.171,
    icon: 'nightlife', color: '#555555',
    label: { nl: 'Hangar', en: 'Hangar', fr: 'Hangar', de: 'Hangar' },
    info:  { nl: 'Non-stop house / techno / dance', en: 'Non-stop house / techno / dance', fr: 'House / Techno non-stop', de: 'Non-Stop House / Techno' },
  },
  {
    id: 'food1', x: 0.121, y: 0.628,
    icon: 'restaurant', color: '#FF8C00',
    label: { nl: 'Food & Drank', en: 'Food & Drinks', fr: 'Nourriture & Boissons', de: 'Essen & Trinken' },
    info:  { nl: 'Food- en drankstand', en: 'Food and drink stand', fr: 'Stand nourriture et boissons', de: 'Essen- und Getränkestand' },
  },
  {
    id: 'food2', x: 0.352, y: 0.440,
    icon: 'restaurant', color: '#FF8C00',
    label: { nl: 'Food & Drank', en: 'Food & Drinks', fr: 'Nourriture & Boissons', de: 'Essen & Trinken' },
    info:  { nl: 'Food- en drankstand', en: 'Food and drink stand', fr: 'Stand nourriture et boissons', de: 'Essen- und Getränkestand' },
  },
  {
    id: 'lockers', x: 0.272, y: 0.823,
    icon: 'lock', color: '#9C27B0',
    label: { nl: 'Kluisjes', en: 'Lockers', fr: 'Casiers', de: 'Schließfächer' },
    info:  { nl: 'Kluisjes te huur – medium & groot', en: 'Lockers for rent – medium & large', fr: 'Casiers à louer – moyen & grand', de: 'Schließfächer zu mieten – mittel & groß' },
  },
  {
    id: 'ehbo', x: 0.182, y: 0.306,
    icon: 'local_hospital', color: '#4CAF50',
    label: { nl: 'EHBO', en: 'First Aid', fr: 'Premiers Secours', de: 'Erste Hilfe' },
    info:  { nl: 'Eerste hulp post', en: 'First aid station', fr: 'Poste de premiers secours', de: 'Erste-Hilfe-Station' },
  },
  {
    id: 'toilet', x: 0.078, y: 0.786,
    icon: 'wc', color: '#607D8B',
    label: { nl: 'Toilet', en: 'Toilet', fr: 'Toilettes', de: 'Toilette' },
    info:  { nl: 'Toiletten', en: 'Toilets', fr: 'Toilettes', de: 'Toiletten' },
  },
]

// Waypoints die om het water heen lopen
// Kaart-layout: water zit links-onder; hoofdpad loopt langs de rand
const P = {
  entrance: { x: 0.690, y: 0.849 },
  // Onderste weg van rechts naar links (onder het water langs)
  b1: { x: 0.580, y: 0.830 },
  b2: { x: 0.450, y: 0.810 },
  b3: { x: 0.340, y: 0.790 },
  b4: { x: 0.230, y: 0.760 },
  // Linkerkant omhoog (buitenlangs het water)
  l1: { x: 0.210, y: 0.690 },
  l2: { x: 0.215, y: 0.620 },
  // Centraal pad naar rechts
  c1: { x: 0.310, y: 0.540 },
  c2: { x: 0.420, y: 0.480 },
  c3: { x: 0.540, y: 0.455 },
  // Rechterkant omhoog
  r1: { x: 0.640, y: 0.390 },
  r2: { x: 0.760, y: 0.310 },
  r3: { x: 0.880, y: 0.215 },
}

function getRoutePoints(m) {
  const { x, y, id } = m
  const to = { x, y }
  switch (id) {
    case 'entrance': return [P.entrance, to]
    case 'ponton':   return [P.entrance, P.b1, P.b2, P.b3, P.b4, P.l1, P.l2, to]
    case 'lake':     return [P.entrance, P.b1, P.b2, P.b3, P.b4, P.l1, P.c1, P.c2, P.c3, to]
    case 'club':     return [P.entrance, P.b1, P.b2, P.c1, P.c2, P.c3, P.r1, to]
    case 'hangar':   return [P.entrance, P.b1, P.c2, P.r1, P.r2, P.r3, to]
    case 'food1':    return [P.entrance, P.b1, P.b2, P.b3, P.b4, P.l1, to]
    case 'food2':    return [P.entrance, P.b1, P.b2, P.b3, P.c1, P.c2, to]
    case 'lockers':  return [P.entrance, P.b1, P.b2, to]
    case 'ehbo':     return [P.entrance, P.b1, P.b2, P.b3, P.b4, P.l1, P.c1, to]
    case 'toilet':   return [P.entrance, P.b1, P.b2, P.b3, P.b4, to]
    default:         return [P.entrance, to]
  }
}

function pointsToPath(pts) {
  return pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x * 100} ${p.y * 100}`).join(' ')
}

const stageColors = {
  entrance: '#4CAF50', ponton: '#F03228', lake: '#247BA0',
  club: '#E3B505', hangar: '#555555', food1: '#FF8C00',
  food2: '#FF8C00', lockers: '#9C27B0', ehbo: '#4CAF50', toilet: '#607D8B',
}

export default function Map({ language }) {
  const lang = t[language] || t.nl
  const containerRef = useRef(null)

  const [scale, setScale]             = useState(1)
  const [offset, setOffset]           = useState({ x: 0, y: 0 })
  const [activeMarker, setActiveMarker] = useState(null)
  const [route, setRoute]             = useState(null)
  const [showLegend, setShowLegend]   = useState(false)

  const dragRef  = useRef({ dragging: false, lastX: 0, lastY: 0 })
  const pinchRef = useRef({ dist: 0 })
  const movedRef = useRef(false)

  const onMouseDown = useCallback(e => {
    dragRef.current = { dragging: true, lastX: e.clientX, lastY: e.clientY }
    movedRef.current = false
  }, [])
  const onMouseMove = useCallback(e => {
    if (!dragRef.current.dragging) return
    const dx = e.clientX - dragRef.current.lastX
    const dy = e.clientY - dragRef.current.lastY
    if (Math.abs(dx) > 2 || Math.abs(dy) > 2) movedRef.current = true
    setOffset(o => ({ x: o.x + dx, y: o.y + dy }))
    dragRef.current.lastX = e.clientX
    dragRef.current.lastY = e.clientY
  }, [])
  const onMouseUp = useCallback(() => { dragRef.current.dragging = false }, [])

  const onWheel = useCallback(e => {
    e.preventDefault()
    setScale(s => Math.min(Math.max(s * (e.deltaY > 0 ? 0.9 : 1.1), 0.5), 5))
  }, [])

  const onTouchStart = useCallback(e => {
    movedRef.current = false
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY
      pinchRef.current.dist = Math.sqrt(dx * dx + dy * dy)
    } else {
      dragRef.current = { dragging: true, lastX: e.touches[0].clientX, lastY: e.touches[0].clientY }
    }
  }, [])
  const onTouchMove = useCallback(e => {
    e.preventDefault()
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY
      const dist = Math.sqrt(dx * dx + dy * dy)
      const delta = dist / (pinchRef.current.dist || dist)
      pinchRef.current.dist = dist
      setScale(s => Math.min(Math.max(s * delta, 0.5), 5))
      movedRef.current = true
    } else if (e.touches.length === 1 && dragRef.current.dragging) {
      const dx = e.touches[0].clientX - dragRef.current.lastX
      const dy = e.touches[0].clientY - dragRef.current.lastY
      if (Math.abs(dx) > 2 || Math.abs(dy) > 2) movedRef.current = true
      setOffset(o => ({ x: o.x + dx, y: o.y + dy }))
      dragRef.current.lastX = e.touches[0].clientX
      dragRef.current.lastY = e.touches[0].clientY
    }
  }, [])
  const onTouchEnd = useCallback(() => { dragRef.current.dragging = false }, [])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [onWheel])

  const handleMarkerClick = (m) => {
    if (movedRef.current) return
    setActiveMarker(prev => prev?.id === m.id && !route ? null : m)
    setRoute(null)
  }

  const lbl = (obj) => obj?.[language] || obj?.nl || ''

  return (
    <div className="map-page">
      <div className="map-header">
        <div>
          <p className="page-title">{lang.title}</p>
          <h1 className="page-heading" style={{ marginBottom: 0 }}>{lang.heading}</h1>
        </div>
        <button className="legend-toggle-btn" onClick={() => setShowLegend(true)}>
          <span className="material-icons">map</span>
          <span>{lang.legend}</span>
        </button>
      </div>

      {route && (
        <div className="route-banner" style={{ borderColor: route.to.color }}>
          <div className="route-icon" style={{ background: route.to.color }}>
            <span className="material-icons">directions_walk</span>
          </div>
          <span className="route-text">{lang.routeTo}: <strong>{lbl(route.to.label)}</strong></span>
          <button className="route-clear-btn" onClick={() => { setRoute(null); setActiveMarker(null) }}>
            <span className="material-icons">close</span>
          </button>
        </div>
      )}

      <div
        ref={containerRef}
        className="map-container"
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div
          className="map-inner"
          style={{ transform: `translate(${offset.x}px,${offset.y}px) scale(${scale})` }}
        >
          <img src="/kaart_festival_no_markers.svg" alt="Festival map" className="map-svg" draggable={false} />

          {route && (
            <svg className="route-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path
                d={pointsToPath(route.points)}
                stroke={route.to.color}
                strokeWidth="1.2"
                strokeDasharray="2.5 1.5"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle r="1.2" fill={route.to.color} opacity="0.95">
                <animateMotion dur="4s" repeatCount="indefinite" path={pointsToPath(route.points)} />
              </circle>
            </svg>
          )}

          {markers.map(m => (
            <button
              key={m.id}
              className={`map-marker ${activeMarker?.id === m.id ? 'active' : ''} ${route?.to.id === m.id ? 'destination' : ''}`}
              style={{ left: `${m.x * 100}%`, top: `${m.y * 100}%`, '--mc': m.color }}
              onClick={() => handleMarkerClick(m)}
            >
              <span className="material-icons marker-icon">{m.icon}</span>
            </button>
          ))}
        </div>

        {activeMarker && !route && (
          <div className="marker-popup" style={{ borderColor: activeMarker.color }}>
            <div className="popup-icon" style={{ background: activeMarker.color }}>
              <span className="material-icons">{activeMarker.icon}</span>
            </div>
            <div className="popup-info">
              <strong>{lbl(activeMarker.label)}</strong>
              <span>{lbl(activeMarker.info)}</span>
            </div>
            <div className="popup-actions">
              <button
                className="popup-navigate-btn"
                style={{ background: activeMarker.color }}
                onClick={() => setRoute({ to: activeMarker, points: getRoutePoints(activeMarker) })}
              >
                <span className="material-icons">directions_walk</span>
                {lang.navigate}
              </button>
              <button className="popup-close" onClick={() => setActiveMarker(null)}>
                <span className="material-icons">close</span>
              </button>
            </div>
          </div>
        )}

        <div className="zoom-controls">
          <button className="zoom-btn" onClick={() => setScale(s => Math.min(s * 1.3, 5))}>
            <span className="material-icons">add</span>
          </button>
          <button className="zoom-btn" onClick={() => setScale(s => Math.max(s * 0.77, 0.5))}>
            <span className="material-icons">remove</span>
          </button>
          <button className="zoom-btn" onClick={() => { setScale(1); setOffset({ x: 0, y: 0 }) }}>
            <span className="material-icons">center_focus_strong</span>
          </button>
        </div>
      </div>

      {showLegend && (
        <div className="legend-overlay" onClick={() => setShowLegend(false)}>
          <div className="legend-modal" onClick={e => e.stopPropagation()}>
            <button className="legend-close-btn" onClick={() => setShowLegend(false)}>
              <span className="material-icons">close</span>
              <span>{lang.close}</span>
            </button>
            <div className="legend-scroll">
              <img src="/legenda.svg" alt="Legenda" className="legend-img" draggable={false} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
