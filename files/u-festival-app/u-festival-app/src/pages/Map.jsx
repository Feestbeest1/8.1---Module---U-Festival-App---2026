import { useEffect, useRef, useState, useCallback } from 'react'
import { markers as staticMarkers } from '../data/markers.js'
import { acts, stages } from '../data/acts.js'
import { getMarkers } from '../data/db.js'
import './Map.css'

const t = {
  nl: { title: "FESTIVALTERREIN", heading: "KAART", legend: "Legenda", close: "Sluiten",
        routeTo: "Route naar", clearRoute: "Route wissen", navigate: "Navigeer",
        gps: "Mijn locatie", gpsDenied: "GPS-toegang geweigerd", gpsUnavail: "GPS niet beschikbaar", gpsSearching: "Locatie zoeken…",
        gpsOutside: "Je bent buiten het festivalterrein",
        saturday: "Zaterdag", sunday: "Zondag", lineup: "Programma" },
  en: { title: "FESTIVAL GROUNDS", heading: "MAP", legend: "Legend", close: "Close",
        routeTo: "Route to", clearRoute: "Clear route", navigate: "Navigate",
        gps: "My location", gpsDenied: "GPS access denied", gpsUnavail: "GPS not available", gpsSearching: "Searching…",
        gpsOutside: "You are outside the festival grounds",
        saturday: "Saturday", sunday: "Sunday", lineup: "Line-up" },
  fr: { title: "TERRAIN DU FESTIVAL", heading: "CARTE", legend: "Légende", close: "Fermer",
        routeTo: "Itinéraire vers", clearRoute: "Effacer", navigate: "Naviguer",
        gps: "Ma position", gpsDenied: "Accès GPS refusé", gpsUnavail: "GPS indisponible", gpsSearching: "Recherche…",
        gpsOutside: "Vous êtes hors du site du festival",
        saturday: "Samedi", sunday: "Dimanche", lineup: "Programme" },
  de: { title: "FESTIVALGELÄNDE", heading: "KARTE", legend: "Legende", close: "Schließen",
        routeTo: "Route nach", clearRoute: "Route löschen", navigate: "Navigieren",
        gps: "Mein Standort", gpsDenied: "GPS-Zugriff verweigert", gpsUnavail: "GPS nicht verfügbar", gpsSearching: "Suche…",
        gpsOutside: "Sie befinden sich außerhalb des Festivalgeländes",
        saturday: "Samstag", sunday: "Sonntag", lineup: "Programm" },
}

// Stage-IDs die een lineup-popup krijgen
const STAGE_IDS = ['ponton', 'lake', 'club', 'hangar']

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

// Controleer of de gebruiker daadwerkelijk op of bij het festivalterrein is
function isWithinBounds(lat, lon) {
  const pad = 0.0025  // ~250m marge rondom het terrein
  return lat >= MAP_BOUNDS.south - pad && lat <= MAP_BOUNDS.north + pad &&
         lon >= MAP_BOUNDS.west  - pad && lon <= MAP_BOUNDS.east  + pad
}

// ── Waypoints die om het water heen lopen ─────────────────────────────────
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

function getRoutePoints(m, from = P.entrance) {
  const { x, y, id } = m
  const to = { x, y }
  switch (id) {
    case 'entrance':  return [from, to]
    case 'ponton':    return [from, P.b1, P.b2, P.b3, P.b4, P.l1, P.l2, to]
    case 'lake':      return [from, P.b1, P.b2, P.b3, P.b4, P.l1, P.c1, P.c2, P.c3, to]
    case 'club':      return [from, P.b1, P.b2, P.c1, P.c2, P.c3, P.r1, to]
    case 'hangar':    return [from, P.b1, P.c2, P.r1, P.r2, P.r3, to]
    case 'food1':     return [from, P.b1, P.b2, P.b3, P.b4, P.l1, to]
    case 'food2':     return [from, P.b1, P.b2, P.b3, P.c1, P.c2, to]
    case 'food3':     return [from, P.b1, P.b2, P.b3, P.b4, to]
    case 'food4':     return [from, P.b1, P.c2, P.c3, P.r1, to]
    case 'food5':     return [from, P.b1, P.b2, P.c1, to]
    case 'bar1':      return [from, P.b1, P.c2, P.r1, P.r2, to]
    case 'bar2':      return [from, P.b1, P.c2, P.r1, to]
    case 'bar3':      return [from, P.b1, P.b2, P.c1, P.c2, to]
    case 'bar4':      return [from, P.b1, P.b2, P.b3, P.b4, to]
    case 'lockers':   return [from, P.b1, P.b2, to]
    case 'lockers2':  return [from, P.b1, P.b2, to]
    case 'ehbo':      return [from, P.b1, P.b2, P.b3, P.b4, P.l1, P.c1, to]
    case 'toilet':    return [from, P.b1, P.b2, P.b3, P.b4, to]
    case 'toilet2':   return [from, P.b1, P.c2, P.r1, P.r2, to]
    case 'toilet3':   return [from, P.b1, P.b2, P.c1, P.c2, P.c3, to]
    case 'info1':     return [from, P.b1, P.c2, P.r1, P.r2, P.r3, to]
    case 'info2':     return [from, P.b1, P.c2, P.r1, to]
    case 'info3':     return [from, P.b1, P.b2, P.c1, to]
    case 'info4':     return [from, P.b1, P.b2, P.b3, to]
    default:          return [from, to]
  }
}

function pointsToPath(pts) {
  return pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x * 100} ${p.y * 100}`).join(' ')
}

// ── Hoofd-component ───────────────────────────────────────────────────────
export default function Map({ language }) {
  const lang = t[language] || t.nl
  const containerRef = useRef(null)

  const [markers, setMarkers]           = useState(staticMarkers)
  const [scale, setScale]               = useState(1)
  const [offset, setOffset]             = useState({ x: 0, y: 0 })
  const [activeMarker, setActiveMarker] = useState(null)
  const [routeTarget, setRouteTarget]   = useState(null)
  const [showLegend, setShowLegend]     = useState(false)
  const [followMode, setFollowMode]     = useState(false)
  const followModeRef = useRef(false)
  useEffect(() => { followModeRef.current = followMode }, [followMode])

  useEffect(() => {
    getMarkers().then(data => { if (data?.length) setMarkers(data) })
  }, [])

  // Centreer bij opstarten op de ingang (zoom 2.5×)
  useEffect(() => {
    requestAnimationFrame(() => {
      if (!containerRef.current) return
      const { offsetWidth: w, offsetHeight: h } = containerRef.current
      const s = 2.5
      scaleRef.current = s
      setScale(s)
      setOffset({
        x: s * w * (0.5 - P.entrance.x),
        y: s * h * (0.5 - P.entrance.y),
      })
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // GPS-locatie
  const [gpsPos, setGpsPos]         = useState(null)
  const [gpsLoading, setGpsLoading] = useState(false)
  const [gpsError, setGpsError]     = useState(null)
  const watchIdRef     = useRef(null)
  const langRef        = useRef(lang)
  const gpsPosRef      = useRef(null)
  const centeredRef    = useRef(false)
  const scaleRef       = useRef(scale)
  useEffect(() => { langRef.current = lang })
  useEffect(() => { scaleRef.current = scale }, [scale])

  // Route wordt dynamisch berekend vanuit huidige GPS-positie (of ingang als fallback)
  const route = routeTarget
    ? { to: routeTarget, points: getRoutePoints(routeTarget, gpsPos || P.entrance) }
    : null

  // Correcte formule voor transform-origin: center center
  // screen_x = s*(fx*w - w/2) + ox + w/2  →  ox = s*w*(0.5 - fx)
  const centerOnGPS = useCallback((pos) => {
    if (!pos || !containerRef.current) return
    const { offsetWidth: w, offsetHeight: h } = containerRef.current
    const s = scaleRef.current
    setOffset({
      x: s * w * (0.5 - pos.x),
      y: s * h * (0.5 - pos.y),
    })
  }, [])

  const stopGPS = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }
    setGpsPos(null); setGpsLoading(false); setGpsError(null)
    gpsPosRef.current = null; centeredRef.current = false
  }, [])

  const handleGpsPosition = useCallback((pos) => {
    setGpsLoading(false)
    const { latitude, longitude } = pos.coords
    if (!isWithinBounds(latitude, longitude)) {
      setGpsPos(null)
      gpsPosRef.current = null
      setGpsError(langRef.current.gpsOutside)
      setTimeout(() => setGpsError(null), 6000)
      return
    }
    const xy = gpsToXY(latitude, longitude)
    gpsPosRef.current = xy
    setGpsPos(xy)
    setGpsError(null)
    // Eerste fix: altijd centreren. Daarna alleen als volgmodus actief is.
    if (!centeredRef.current || followModeRef.current) {
      centeredRef.current = true
      centerOnGPS(xy)
    }
  }, [centerOnGPS]) // eslint-disable-line react-hooks/exhaustive-deps

  const GPS_OPTS = { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 }

  // Auto-start GPS zodra de kaartpagina wordt geopend
  useEffect(() => {
    if (!navigator.geolocation) {
      setGpsError(langRef.current.gpsUnavail)
      return
    }
    setGpsLoading(true)
    watchIdRef.current = navigator.geolocation.watchPosition(
      handleGpsPosition,
      (err) => {
        setGpsLoading(false)
        watchIdRef.current = null
        setGpsError(err.code === 1 ? langRef.current.gpsDenied : langRef.current.gpsUnavail)
        setTimeout(() => setGpsError(null), 5000)
      },
      GPS_OPTS,
    )
    return () => {
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // GPS-knop: volgmodus aan/uit. Als GPS nog niet actief: start + volgmodus aan.
  const handleGPS = useCallback(() => {
    if (gpsLoading) { stopGPS(); setFollowMode(false); return }
    if (gpsPos) {
      // Wissel volgmodus; centreer direct als we inschakelen
      setFollowMode(prev => {
        if (!prev) centerOnGPS(gpsPos)
        return !prev
      })
      return
    }
    // GPS nog niet actief — start en schakel volgmodus in
    if (!navigator.geolocation) { setGpsError(langRef.current.gpsUnavail); return }
    setGpsLoading(true); setGpsError(null); centeredRef.current = false
    setFollowMode(true)
    watchIdRef.current = navigator.geolocation.watchPosition(
      handleGpsPosition,
      (err) => {
        setGpsLoading(false); watchIdRef.current = null; setFollowMode(false)
        setGpsError(err.code === 1 ? langRef.current.gpsDenied : langRef.current.gpsUnavail)
        setTimeout(() => setGpsError(null), 5000)
      },
      GPS_OPTS,
    )
  }, [gpsPos, gpsLoading, centerOnGPS, stopGPS, handleGpsPosition]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Drag & pinch ─────────────────────────────────────────────────────────
  const dragRef  = useRef({ dragging: false, lastX: 0, lastY: 0 })
  const pinchRef = useRef({ dist: 0 })
  const movedRef = useRef(false)

  const onMouseDown = useCallback(e => {
    setFollowMode(false)
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
    setFollowMode(false)
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
    setActiveMarker(prev => prev?.id === m.id && !routeTarget ? null : m)
    setRouteTarget(null)
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
          <button className="route-clear-btn" onClick={() => { setRouteTarget(null); setActiveMarker(null) }}>
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
          className={`map-inner${followMode ? ' map-following' : ''}`}
          style={{ transform: `translate(${offset.x}px,${offset.y}px) scale(${scale})` }}
        >
          <img src="/kaart_festival_markers.svg" alt="Festival map" className="map-svg" draggable={false} />

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

          {/* Onzichtbare hotspots over de SVG-markers */}
          {markers.map(m => (
            <button
              key={m.id}
              className={`map-hotspot ${activeMarker?.id === m.id ? 'active' : ''} ${routeTarget?.id === m.id ? 'destination' : ''}`}
              style={{
                left: `${m.x * 100}%`,
                top:  `${m.y * 100}%`,
                width:  `${(m.r * 2 / 2330.58) * 100}%`,
                height: `${(m.r * 2 / 1353.19) * 100}%`,
                '--mc': m.color,
              }}
              onClick={() => handleMarkerClick(m)}
              aria-label={m.label?.nl}
            />
          ))}

          {/* GPS-stip voor eigen locatie */}
          {gpsPos && (
            <div className="gps-marker" style={{ left: `${gpsPos.x * 100}%`, top: `${gpsPos.y * 100}%` }}>
              <div className="gps-pulse" />
              <div className="gps-dot" />
            </div>
          )}
        </div>

        {/* Marker popup — podium toont lineup, overige tonen korte info */}
        {activeMarker && !route && (() => {
          const isStage = STAGE_IDS.includes(activeMarker.id)
          const stageData = isStage ? stages.find(s => s.id === activeMarker.id) : null
          const stageName = stageData?.name ?? lbl(activeMarker.label)
          const stageActs = isStage
            ? acts.filter(a => a.stage === stageName).sort((a, b) => {
                if (a.day !== b.day) return a.day === 'saturday' ? -1 : 1
                return a.time.localeCompare(b.time)
              })
            : []
          const satActs = stageActs.filter(a => a.day === 'saturday')
          const sunActs = stageActs.filter(a => a.day === 'sunday')

          return isStage ? (
            <div className="stage-popup" style={{ borderColor: activeMarker.color }}>
              {/* Header */}
              <div className="stage-popup-header" style={{ background: activeMarker.color }}>
                <div className="stage-popup-title">
                  <span className="material-icons">{activeMarker.icon}</span>
                  <strong>{stageName}</strong>
                </div>
                <div className="stage-popup-actions">
                  <button
                    className="popup-navigate-btn"
                    style={{ background: 'rgba(0,0,0,0.25)' }}
                    onClick={() => setRouteTarget(activeMarker)}
                  >
                    <span className="material-icons">directions_walk</span>
                    {lang.navigate}
                  </button>
                  <button className="popup-close" style={{ color: '#fff' }} onClick={() => setActiveMarker(null)}>
                    <span className="material-icons">close</span>
                  </button>
                </div>
              </div>
              {/* Acts lijst */}
              <div className="stage-popup-body">
                {[{ label: lang.saturday, list: satActs }, { label: lang.sunday, list: sunActs }].map(({ label, list }) =>
                  list.length > 0 && (
                    <div key={label} className="stage-day-block">
                      <div className="stage-day-label">{label}</div>
                      {list.map(act => (
                        <div key={act.id} className="stage-act-row">
                          <span className="act-time">{act.time}</span>
                          <span className="act-name">{act.name}</span>
                          <span className="act-genre">{act.genre}</span>
                        </div>
                      ))}
                    </div>
                  )
                )}
              </div>
            </div>
          ) : (
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
                  onClick={() => setRouteTarget(activeMarker)}
                >
                  <span className="material-icons">directions_walk</span>
                  {lang.navigate}
                </button>
                <button className="popup-close" onClick={() => setActiveMarker(null)}>
                  <span className="material-icons">close</span>
                </button>
              </div>
            </div>
          )
        })()}

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
            className={`zoom-btn gps-toggle-btn ${gpsPos ? 'gps-active' : ''} ${gpsLoading ? 'gps-loading' : ''} ${followMode ? 'gps-following' : ''}`}
            onClick={handleGPS}
            title={followMode ? 'Volgmodus actief' : lang.gps}
          >
            <span className="material-icons">
              {gpsLoading ? 'gps_not_fixed' : followMode ? 'navigation' : gpsPos ? 'gps_fixed' : 'my_location'}
            </span>
          </button>
        </div>
      </div>

      {/* Legenda — compact paneel op de kaart */}
      {showLegend && (
        <div className="legend-panel" onClick={e => e.stopPropagation()}>
          <div className="legend-panel-header">
            <span className="legend-panel-title">{lang.legend}</span>
            <button className="legend-panel-close" onClick={() => setShowLegend(false)}>
              <span className="material-icons">close</span>
            </button>
          </div>
          <div className="legend-panel-body">
            {/* Één item per categorie (dedup op icon-type) */}
            {markers.reduce((acc, m) => {
              if (!acc.find(a => a.icon === m.icon)) acc.push(m)
              return acc
            }, []).map(m => (
              <div key={m.id} className="legend-item">
                <div className="legend-pin" style={{ background: m.color }}>
                  <span className="material-icons legend-pin-icon">{m.icon}</span>
                </div>
                <span className="legend-label">{lbl(m.label)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
