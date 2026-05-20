import { useEffect, useRef, useState } from 'react'
import './Map.css'

const t = {
  nl: { title: "FESTIVALTERREIN", heading: "KAART", locating: "Locatie bepalen...", noGps: "GPS niet beschikbaar", tapInfo: "Tik op een marker voor info" },
  en: { title: "FESTIVAL GROUNDS", heading: "MAP", locating: "Locating...", noGps: "GPS not available", tapInfo: "Tap a marker for info" }
}

const markers = [
  { id: 'ponton',      label: 'Ponton',      x: 0.30, y: 0.45, icon: 'music_note',  color: '#F03228', info: 'Main stage – Hoofdacts' },
  { id: 'lake',        label: 'The Lake',    x: 0.65, y: 0.35, icon: 'water',        color: '#247BA0', info: 'Onbekend talent' },
  { id: 'club',        label: 'The Club',    x: 0.50, y: 0.65, icon: 'theater_comedy', color: '#E3B505', info: 'Theater & Stand-up comedy' },
  { id: 'hangar',      label: 'Hangar',      x: 0.75, y: 0.60, icon: 'nightlife',    color: '#555555', info: 'Non-stop house/techno/dance' },
  { id: 'entrance',    label: 'Ingang',      x: 0.20, y: 0.80, icon: 'login',        color: '#4CAF50', info: 'Ingang & Uitgang' },
  { id: 'bar',         label: 'Bar',         x: 0.40, y: 0.55, icon: 'local_bar',    color: '#F03228', info: 'Bar' },
  { id: 'icecream',    label: 'Ijs',         x: 0.55, y: 0.45, icon: 'icecream',     color: '#FF8C00', info: 'IJskraam' },
  { id: 'merch',       label: 'Merch',       x: 0.25, y: 0.60, icon: 'storefront',   color: '#9C27B0', info: 'Merchandise' },
]

export default function Map({ language }) {
  const lang = t[language] || t.nl
  const containerRef = useRef(null)
  const [scale, setScale] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [activeMarker, setActiveMarker] = useState(null)
  const [userPos, setUserPos] = useState(null)
  const [gpsStatus, setGpsStatus] = useState('idle')

  const lastTouchRef = useRef(null)
  const lastDistRef = useRef(null)
  const isDraggingRef = useRef(false)

  useEffect(() => {
    if (!navigator.geolocation) { setGpsStatus('unavailable'); return }
    setGpsStatus('locating')
    const watcher = navigator.geolocation.watchPosition(
      () => { setUserPos({ x: 0.45, y: 0.52 }); setGpsStatus('found') },
      () => setGpsStatus('unavailable'),
      { enableHighAccuracy: true }
    )
    return () => navigator.geolocation.clearWatch(watcher)
  }, [])

  // Touch handlers for pinch & drag
  const onTouchStart = (e) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY
      lastDistRef.current = Math.sqrt(dx * dx + dy * dy)
    } else if (e.touches.length === 1) {
      lastTouchRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    }
  }

  const onTouchMove = (e) => {
    e.preventDefault()
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (lastDistRef.current) {
        const delta = dist / lastDistRef.current
        setScale(s => Math.min(Math.max(s * delta, 0.8), 3))
      }
      lastDistRef.current = dist
      isDraggingRef.current = true
    } else if (e.touches.length === 1 && lastTouchRef.current) {
      const dx = e.touches[0].clientX - lastTouchRef.current.x
      const dy = e.touches[0].clientY - lastTouchRef.current.y
      setOffset(o => ({ x: o.x + dx, y: o.y + dy }))
      lastTouchRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
      isDraggingRef.current = true
    }
  }

  const onTouchEnd = () => {
    lastDistRef.current = null
    setTimeout(() => { isDraggingRef.current = false }, 100)
  }

  return (
    <div className="map-page">
      <div className="map-header">
        <div>
          <p className="page-title">{lang.title}</p>
          <h1 className="page-heading" style={{ marginBottom: 0 }}>{lang.heading}</h1>
        </div>
        <div className={`gps-indicator ${gpsStatus}`}>
          <span className="material-icons">{gpsStatus === 'found' ? 'my_location' : 'location_searching'}</span>
        </div>
      </div>

      <p className="map-hint">{lang.tapInfo}</p>

      <div
        ref={containerRef}
        className="map-container"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div
          className="map-inner"
          style={{ transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})` }}
        >
          <img src="/kaart_festival_no_markers.svg" alt="Festival map" className="map-svg" draggable={false} />

          {markers.map(m => (
            <button
              key={m.id}
              className={`map-marker ${activeMarker?.id === m.id ? 'active' : ''}`}
              style={{ left: `${m.x * 100}%`, top: `${m.y * 100}%`, '--mc': m.color }}
              onClick={() => setActiveMarker(activeMarker?.id === m.id ? null : m)}
            >
              <span className="material-icons marker-icon">{m.icon}</span>
            </button>
          ))}

          {userPos && (
            <div className="user-marker" style={{ left: `${userPos.x * 100}%`, top: `${userPos.y * 100}%` }}>
              <div className="user-dot" />
              <div className="user-pulse" />
            </div>
          )}
        </div>
      </div>

      {activeMarker && (
        <div className="marker-popup" style={{ borderColor: activeMarker.color }}>
          <div className="popup-icon" style={{ background: activeMarker.color }}>
            <span className="material-icons">{activeMarker.icon}</span>
          </div>
          <div className="popup-info">
            <strong>{activeMarker.label}</strong>
            <span>{activeMarker.info}</span>
          </div>
          <button className="popup-close" onClick={() => setActiveMarker(null)}>
            <span className="material-icons">close</span>
          </button>
        </div>
      )}
    </div>
  )
}
