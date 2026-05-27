import { useEffect, useRef, useState, useCallback } from 'react'
import { markers } from '../data/markers.js'
import './Map.css'

const t = {
  nl: { title: "FESTIVALTERREIN", heading: "KAART", legend: "Legenda", close: "Sluiten",
        routeTo: "Route naar", clearRoute: "Route wissen", navigate: "Navigeer",
        gps: "Mijn locatie", gpsDenied: "GPS-toegang geweigerd", gpsUnavail: "GPS niet beschikbaar", gpsSearching: "Locatie zoeken…" },
  en: { title: "FESTIVAL GROUNDS", heading: "MAP", legend: "Legend", close: "Close",
        routeTo: "Route to", clearRoute: "Clear route", navigate: "Navigate",
        gps: "My location", gpsDenied: "GPS access denied", gpsUnavail: "GPS not available", gpsSearching: "Searching…" },
  fr: { title: "TERRAIN DU FESTIVAL", heading: "CARTE", legend: "Légende", close: "Fermer",
        routeTo: "Itinéraire vers", clearRoute: "Effacer", navigate: "Naviguer",
        gps: "Ma position", gpsDenied: "Accès GPS refusé", gpsUnavail: "GPS indisponible", gpsSearching: "Recherche…" },
  de: { title: "FESTIVALGELÄNDE", heading: "KARTE", legend: "Legende", close: "Schließen",
        routeTo: "Route nach", clearRoute: "Route löschen", navigate: "Navigieren",
        gps: "Mein Standort", gpsDenied: "GPS-Zugriff verweigert", gpsUnavail: "GPS nicht verfügbar", gpsSearching: "Suche…" },
}

// ── GPS: kaartgrenzen van Strijkviertel (Utrecht) ─────────────────────────
// Het SVG viewBox-coördinatensysteem wordt lineair gemapt op geografische coords.
const MAP_BOUNDS = {
  north: 52.0700,   // bovenkant kaart
  south: 52.0625,   // onderkant kaart
  west:  5.0710,    // linkerkant kaart
  east:  5.0910,    // rechterkant kaart
}

function gpsToXY(lat, lon) {
  const x = (lon - MAP_BOUNDS.west)  / (MAP_BOUNDS.east  - MAP_BOUNDS.west)
  const y = (MAP_BOUNDS.north - lat) / (MAP_BOUNDS.north - MAP_BOUNDS.south)
  return {
    x: Math.max(0, Math.min(1, x)),
    y: Math.max(0, Math.min(1, y)),
  }
}

// ── Waypoints die om het water heen lopen ─────────────────────────────────
// Kaart-layout: water zit links-onder; hoofdpad loopt langs de rand
const P = {
  entrance: { x: 0.690, y: 0.849 },
  b1: { x: 0.580, y: 0.830 },
  b2: { x: 0.450, y: 0.810 },
  b3: { x: 0.340, y: 0.790 },
  b4: { x: 0.230, y: 0.760 },
  l1: { x: 0.210, y: 0.690 },
  l2: { x: 0.215, y: 0.620 },
  c1: { x: 0.310, y: 0.540 },
  c2: { x: 0.420, y: 0.480 },
  c3: { x: 0.540, y: 0.455 },
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

// ── Hoofd-component ───────────────────────────────────────────────────────
export default function Map({ language }) {
  const lang = t[language] || t.nl
  const containerRef = useRef(null)

  const [scale, setScale]               = useState(1)
  const [offset, setOffset]             = useState({ x: 0, y: 0 })
  const [activeMarker, setActiveMarker] = useState(null)
  const [route, setRoute]               = useState(null)
  const [showLegend, setShowLegend]     = useState(false)

  // GPS-locatie
  const [gpsPos, setGpsPos]         = useState(null)
  const [gpsLoading, setGpsLoading] = useState(false)
  const [gpsError, setGpsError]     = useState(null)
  const watchIdRef = useRef(null)

  const stopGPS = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }
    setGpsPos(null); setGpsLoading(false); setGpsError(null)
  }, [])

  const handleGPS = useCallback(() => {
    if (watchIdRef.current !== null || gpsPos) { stopGPS(); return }
    if (!navigator.geolocation) { setGpsError(lang.gpsUnavail); return }
    setGpsLoading(true); setGpsError(null)
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        setGpsLoading(false)
        const { latitude, longitude } = pos.coords
        setGpsPos(gpsToXY(latitude, longitude))
      },
      (err) => {
        setGpsLoading(false); watchIdRef.current = null
        setGpsError(err.code === 1 ? lang.gpsDenied : lang.gpsUnavail)
        setTimeout(() => setGpsError(null), 4000)
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 12000 },
    )
  }, [gpsPos, lang, stopGPS])

  useEffect(() => () => {
    if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current)
  }, [])

  // ── Drag & pinch ─────────────────────────────────────────────────────────
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
    dragRef.current.lastX = e.clientX; dragRef.current.lastY = e.clientY
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
      setScale(s => Math.min(Math.max(s * dist / (pinchRef.current.dist || dist), 0.5), 5))
      pinchRef.current.dist = dist; movedRef.current = true
    } else if (e.touches.length === 1 && dragRef.current.dragging) {
      const dx = e.touches[0].clientX - dragRef.current.lastX
      const dy = e.touches[0].clientY - dragRef.current.lastY
      if (Math.abs(dx) > 2 || Math.abs(dy) > 2) movedRef.current = true
      setOffset(o => ({ x: o.x + dx, y: o.y + dy }))
      dragRef.current.lastX = e.touches[0].clientX; dragRef.current.lastY = e.touches[0].clientY
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

          {/* Interactieve markers */}
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

          {/* GPS-stip voor eigen locatie */}
          {gpsPos && (
            <div className="gps-marker" style={{ left: `${gpsPos.x * 100}%`, top: `${gpsPos.y * 100}%` }}>
              <div className="gps-pulse" />
              <div className="gps-dot" />
            </div>
          )}
        </div>

        {/* Marker popup */}
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

        {/* GPS-foutmelding */}
        {gpsError && (
          <div className="gps-error-banner">
            <span className="material-icons">gps_off</span>
            <span>{gpsError}</span>
          </div>
        )}

        {/* Zoom- en GPS-knoppen */}
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
          <button
            className={`zoom-btn gps-toggle-btn ${gpsPos ? 'gps-active' : ''} ${gpsLoading ? 'gps-loading' : ''}`}
            onClick={handleGPS}
            title={lang.gps}
          >
            <span className="material-icons">
              {gpsLoading ? 'gps_not_fixed' : gpsPos ? 'gps_fixed' : 'my_location'}
            </span>
          </button>
        </div>
      </div>

      {/* Legenda */}
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
