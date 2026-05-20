import { useState } from 'react'
import { acts, stages } from '../data/acts.js'
import './Schedule.css'

const t = {
  nl: { title: 'LINE-UP', sat: 'Zaterdag', sun: 'Zondag', close: 'Sluiten', watch: 'Bekijk video', stage: 'Podium', time: 'Tijd' },
  en: { title: 'LINE-UP', sat: 'Saturday', sun: 'Sunday',  close: 'Close',   watch: 'Watch video', stage: 'Stage',  time: 'Time' },
  fr: { title: 'PROGRAMME', sat: 'Samedi', sun: 'Dimanche', close: 'Fermer', watch: 'Voir vidéo',  stage: 'Scène',  time: 'Heure' },
  de: { title: 'LINE-UP', sat: 'Samstag', sun: 'Sonntag',  close: 'Schließen', watch: 'Video ansehen', stage: 'Bühne', time: 'Zeit' },
}

const stageColors = { 'Ponton': '#F03228', 'The Lake': '#247BA0', 'The Club': '#E3B505', 'Hangar': '#333333' }

function timeToMin(t) { const [h,m]=t.split(':').map(Number); return h*60+m }

export default function Schedule({ language }) {
  const lang = t[language] || t.nl
  const [day, setDay] = useState('saturday')
  const [selectedAct, setSelectedAct] = useState(null)
  const [activeTab, setActiveTab] = useState('timeline') // 'timeline' | 'stages'

  const dayActs = acts.filter(a => a.day === day)
  const minTime = 10 * 60
  const colWidth = 80
  const totalWidth = (13 * 60 / 60) * colWidth // 10:00 - 23:00
  const hours = Array.from({length:14},(_,i)=>i+10)

  const lbl = (obj) => obj?.[language] || obj?.en || ''

  return (
    <div className="page schedule-page">
      <p className="page-title">{lang.title}</p>

      {/* Tab: timeline / stages */}
      <div className="schedule-tabs">
        <button className={`stab ${activeTab==='timeline'?'active':''}`} onClick={()=>setActiveTab('timeline')}>
          <span className="material-icons">schedule</span>
        </button>
        <button className={`stab ${activeTab==='stages'?'active':''}`} onClick={()=>setActiveTab('stages')}>
          <span className="material-icons">grid_view</span>
        </button>
      </div>

      {/* Day selector */}
      <div className="day-tabs">
        <button className={`day-tab ${day==='saturday'?'active':''}`} onClick={()=>setDay('saturday')}>{lang.sat}</button>
        <button className={`day-tab ${day==='sunday'?'active':''}`} onClick={()=>setDay('sunday')}>{lang.sun}</button>
      </div>

      {/* TIMELINE VIEW */}
      {activeTab === 'timeline' && (
        <div className="schedule-scroll-wrap">
          <div className="schedule-scroll" style={{width: totalWidth + 80}}>
            {/* Header */}
            <div className="timeline-header" style={{width: totalWidth + 80}}>
              <div style={{width:80, flexShrink:0}}/>
              {hours.map(h=>(
                <div key={h} className="timeline-hour" style={{width:colWidth}}>{h}:00</div>
              ))}
            </div>
            {/* Stages */}
            {stages.map(stage=>{
              const stageActs = dayActs.filter(a=>a.stage===stage.name)
              return (
                <div key={stage.id} className="stage-row" style={{width: totalWidth+80}}>
                  <div className="stage-label" style={{color:stage.color}}>{stage.name}</div>
                  <div className="stage-acts" style={{width:totalWidth, position:'relative', height:56}}>
                    {stageActs.map(act=>{
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

      {/* STAGES VIEW */}
      {activeTab === 'stages' && (
        <div className="stages-grid">
          {stages.map(stage=>(
            <div key={stage.id} className="stage-card">
              <div className="stage-card-img-wrap">
                <img src={stage.image} alt={stage.name} className="stage-card-img"/>
                <div className="stage-card-overlay" style={{background:`${stage.color}CC`}}>
                  <h3 className="stage-card-name">{stage.name}</h3>
                  <p className="stage-card-desc">{lbl(stage.description)}</p>
                </div>
              </div>
              <div className="stage-acts-list">
                {dayActs.filter(a=>a.stage===stage.name).map(act=>(
                  <button key={act.id} className="stage-act-item" onClick={()=>setSelectedAct(act)}>
                    <div className="act-dot" style={{background:stage.color}}/>
                    <div className="act-item-info">
                      <span className="act-item-name">{act.name}</span>
                      <span className="act-item-meta">{act.time} · {act.genre}</span>
                    </div>
                    <span className="material-icons act-item-arrow">chevron_right</span>
                  </button>
                ))}
                {dayActs.filter(a=>a.stage===stage.name).length === 0 && (
                  <p className="no-acts">TBA</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ACT DETAIL MODAL */}
      {selectedAct && (
        <div className="act-modal-overlay" onClick={()=>setSelectedAct(null)}>
          <div className="act-modal" onClick={e=>e.stopPropagation()}>
            <div className="act-modal-header" style={{background: stageColors[selectedAct.stage] || '#333'}}>
              <button className="act-modal-close" onClick={()=>setSelectedAct(null)}>
                <span className="material-icons">close</span>
              </button>
              <h2 className="act-modal-name">{selectedAct.name}</h2>
              <p className="act-modal-meta">{selectedAct.stage} · {selectedAct.time} · {selectedAct.genre}</p>
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
                <span className="act-tag" style={{background:stageColors[selectedAct.stage]}}>{selectedAct.stage}</span>
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
