import { useState, useEffect } from 'react'
import { acts as staticActs, stages } from '../data/acts.js'
import { getActs } from '../data/db.js'
import './Schedule.css'

const t = {
  nl: { title: 'LINE-UP', sat: 'Zaterdag', sun: 'Zondag', close: 'Sluiten', watch: 'Bekijk video', stage: 'Podium', time: 'Tijd', all: 'Alle', favs: 'Favorieten', noFavs: 'Nog geen favorieten. Tik op ♡ bij een artiest.' },
  en: { title: 'LINE-UP', sat: 'Saturday', sun: 'Sunday', close: 'Close', watch: 'Watch video', stage: 'Stage', time: 'Time', all: 'All', favs: 'Favourites', noFavs: 'No favourites yet. Tap ♡ on an artist.' },
  fr: { title: 'PROGRAMME', sat: 'Samedi', sun: 'Dimanche', close: 'Fermer', watch: 'Voir vidéo', stage: 'Scène', time: 'Heure', all: 'Tous', favs: 'Favoris', noFavs: 'Pas encore de favoris. Appuyez sur ♡.' },
  de: { title: 'LINE-UP', sat: 'Samstag', sun: 'Sonntag', close: 'Schließen', watch: 'Video ansehen', stage: 'Bühne', time: 'Zeit', all: 'Alle', favs: 'Favoriten', noFavs: 'Noch keine Favoriten. Tippe auf ♡.' },
}

const stageColors = { 'Ponton': '#F03228', 'The Lake': '#247BA0', 'The Club': '#E3B505', 'Hangar': '#333333' }

function timeToMin(t) { const [h,m]=t.split(':').map(Number); return h*60+m }

function textColor(hex) {
  if (!hex) return '#fff'
  const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16)
  return (0.299*r + 0.587*g + 0.114*b) / 255 > 0.55 ? '#000' : '#fff'
}

function useFavorites() {
  const [favs, setFavs] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ufestival_favs') || '[]') } catch { return [] }
  })
  const toggle = (id) => {
    setFavs(prev => {
      const next = prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
      localStorage.setItem('ufestival_favs', JSON.stringify(next))
      return next
    })
  }
  return [favs, toggle]
}

export default function Schedule({ language }) {
  const lang = t[language] || t.nl
  const [acts, setActs] = useState(staticActs)
  const [day, setDay] = useState('saturday')
  const [selectedAct, setSelectedAct] = useState(null)
  const [activeTab, setActiveTab] = useState('stages')
  const [stageFilter, setStageFilter] = useState('all')
  const [showFavsOnly, setShowFavsOnly] = useState(false)
  const [favs, toggleFav] = useFavorites()

  useEffect(() => {
    getActs().then(data => { if (data?.length) setActs(data) })
  }, [])

  const lbl = (obj) => obj?.[language] || obj?.en || ''

  const dayActs = acts.filter(a => {
    if (a.day !== day) return false
    if (showFavsOnly && !favs.includes(a.id)) return false
    if (stageFilter !== 'all' && a.stage !== stageFilter) return false
    return true
  })

  const colWidth = 80
  const minTime = 10 * 60
  const totalWidth = (13 * 60 / 60) * colWidth
  const hours = Array.from({length:14},(_,i)=>i+10)

  const stageNames = stages.map(s => s.name)

  return (
    <div className="page schedule-page">
      <p className="page-title">{lang.title}</p>

      {/* Tab switcher */}
      <div className="schedule-tabs">
        <button className={`stab ${activeTab==='stages'?'active':''}`} onClick={()=>setActiveTab('stages')}>
          <span className="material-icons">grid_view</span>
        </button>
        <button className={`stab ${activeTab==='timeline'?'active':''}`} onClick={()=>setActiveTab('timeline')}>
          <span className="material-icons">schedule</span>
        </button>
        <button
          className={`stab fav-tab ${showFavsOnly?'active fav-active':''}`}
          onClick={()=>{ setShowFavsOnly(v=>!v); setStageFilter('all') }}
          title={lang.favs}
        >
          <span className="material-icons">{showFavsOnly ? 'favorite' : 'favorite_border'}</span>
        </button>
      </div>

      {/* Day selector */}
      <div className="day-tabs">
        <button className={`day-tab ${day==='saturday'?'active':''}`} onClick={()=>setDay('saturday')}>{lang.sat}</button>
        <button className={`day-tab ${day==='sunday'?'active':''}`} onClick={()=>setDay('sunday')}>{lang.sun}</button>
      </div>

      {/* Stage filter (alleen zichtbaar als niet favorieten-modus) */}
      {!showFavsOnly && (
        <div className="stage-filters">
          <button
            className={`stage-filter-btn ${stageFilter==='all'?'active':''}`}
            onClick={()=>setStageFilter('all')}
          >{lang.all}</button>
          {stageNames.map(name => (
            <button
              key={name}
              className={`stage-filter-btn ${stageFilter===name?'active':''}`}
              style={stageFilter===name ? {background: stageColors[name], borderColor: stageColors[name], color: textColor(stageColors[name])} : {}}
              onClick={()=>setStageFilter(name)}
            >{name}</button>
          ))}
        </div>
      )}

      {/* Lege favorieten melding */}
      {showFavsOnly && dayActs.length === 0 && (
        <div className="empty-favs">
          <span className="material-icons">favorite_border</span>
          <p>{lang.noFavs}</p>
        </div>
      )}

      {/* STAGES VIEW */}
      {activeTab === 'stages' && (
        <div className="stages-grid">
          {(stageFilter === 'all' ? stages : stages.filter(s => s.name === stageFilter)).map(stage => {
            const stageActs = dayActs.filter(a => a.stage === stage.name)
            if (showFavsOnly && stageActs.length === 0) return null
            return (
              <div key={stage.id} className="stage-card">
                <div className="stage-card-img-wrap">
                  <img src={stage.image} alt={stage.name} className="stage-card-img"/>
                  <div className="stage-card-overlay" style={{background:`${stage.color}CC`}}>
                    <h3 className="stage-card-name">{stage.name}</h3>
                    <p className="stage-card-desc">{lbl(stage.description)}</p>
                  </div>
                </div>
                <div className="stage-acts-list">
                  {stageActs.map(act => (
                    <button key={act.id} className="stage-act-item" onClick={()=>setSelectedAct(act)}>
                      <div className="act-dot" style={{background:stage.color}}/>
                      <div className="act-item-info">
                        <span className="act-item-name">{act.name}</span>
                        <span className="act-item-meta">{act.time} · {act.genre}</span>
                      </div>
                      <span
                        className={`act-fav-btn ${favs.includes(act.id)?'is-fav':''}`}
                        onClick={e => { e.stopPropagation(); toggleFav(act.id) }}
                        title={favs.includes(act.id) ? 'Verwijder favoriet' : 'Voeg toe aan favorieten'}
                      >
                        <span className="material-icons">{favs.includes(act.id)?'favorite':'favorite_border'}</span>
                      </span>
                    </button>
                  ))}
                  {stageActs.length === 0 && !showFavsOnly && (
                    <p className="no-acts">TBA</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* TIMELINE VIEW */}
      {activeTab === 'timeline' && (
        <div className="schedule-scroll-wrap">
          <div className="schedule-scroll" style={{width: totalWidth + 80}}>
            <div className="timeline-header" style={{width: totalWidth + 80}}>
              <div style={{width:80, flexShrink:0}}/>
              {hours.map(h=>(
                <div key={h} className="timeline-hour" style={{width:colWidth}}>{h}:00</div>
              ))}
            </div>
            {(stageFilter === 'all' ? stages : stages.filter(s => s.name === stageFilter)).map(stage => {
              const stageActs = dayActs.filter(a => a.stage === stage.name)
              if (showFavsOnly && stageActs.length === 0) return null
              return (
                <div key={stage.id} className="stage-row" style={{width: totalWidth+80}}>
                  <div className="stage-label" style={{color:stage.color}}>{stage.name}</div>
                  <div className="stage-acts" style={{width:totalWidth, position:'relative', height:56}}>
                    {stageActs.map(act => {
                      const left = ((timeToMin(act.time)-minTime)/60)*colWidth
                      const width = colWidth*1.5 - 4
                      return (
                        <button
                          key={act.id}
                          className="act-block"
                          style={{left, width, background:stage.color}}
                          onClick={()=>setSelectedAct(act)}
                        >
                          <span className="act-name">{act.name}</span>
                          <span className="act-time">{act.time}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ACT DETAIL MODAL */}
      {selectedAct && (
        <div className="act-modal-overlay" onClick={()=>setSelectedAct(null)}>
          <div className="act-modal" onClick={e=>e.stopPropagation()}>
            <div
              className="act-modal-header"
              style={{background: stageColors[selectedAct.stage] || '#333'}}
            >
              {selectedAct.image && (
                <img src={selectedAct.image} alt={selectedAct.name} className="act-modal-photo" />
              )}
              <div className="act-modal-header-overlay" />
              <button className="act-modal-close" onClick={()=>setSelectedAct(null)}>
                <span className="material-icons">close</span>
              </button>
              <button
                className={`act-modal-fav ${favs.includes(selectedAct.id)?'is-fav':''}`}
                onClick={()=>toggleFav(selectedAct.id)}
              >
                <span className="material-icons">{favs.includes(selectedAct.id)?'favorite':'favorite_border'}</span>
              </button>
              <div className="act-modal-header-text">
                <h2 className="act-modal-name">{selectedAct.name}</h2>
                <p className="act-modal-meta">{selectedAct.tagline}</p>
                <p className="act-modal-sub">{selectedAct.stage} · {selectedAct.time} · {selectedAct.genre}</p>
              </div>
            </div>
            <div className="act-modal-body">
              {selectedAct.youtubeEmbed && (
                <div className="act-video-wrap">
                  <iframe
                    src={`https://www.youtube.com/embed/${selectedAct.youtubeEmbed}?rel=0`}
                    title={selectedAct.name}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="act-video"
                  />
                </div>
              )}
              <p className="act-bio">{lbl(selectedAct.bio)}</p>
              <div className="act-tags">
                <span className="act-tag" style={{background:stageColors[selectedAct.stage], color:textColor(stageColors[selectedAct.stage]||'#333')}}>{selectedAct.stage}</span>
                <span className="act-tag-outline">{selectedAct.genre}</span>
                <span className="act-tag-outline">{selectedAct.time}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
