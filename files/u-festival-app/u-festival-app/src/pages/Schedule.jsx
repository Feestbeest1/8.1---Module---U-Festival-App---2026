import { useState } from 'react'
import { schedule, stages } from '../data/festival.js'
import './Schedule.css'

const t = {
  nl: { title: "LINE-UP", sat: "Zaterdag", sun: "Zondag", day: "DAG" },
  en: { title: "LINE-UP", sat: "Saturday", sun: "Sunday", day: "DAY" }
}

const stageColors = {
  "Ponton": "#F03228",
  "The Lake": "#247BA0",
  "The Club": "#E3B505",
  "Hangar": "#555555"
}

function timeToMinutes(t) {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

export default function Schedule({ language }) {
  const lang = t[language] || t.nl
  const [day, setDay] = useState('saturday')
  const acts = schedule[day]

  const minTime = 10 * 60
  const maxTime = 23 * 60
  const totalMinutes = maxTime - minTime
  const colWidth = 80 // px per hour
  const totalWidth = (totalMinutes / 60) * colWidth

  const hours = []
  for (let h = 10; h <= 23; h++) hours.push(h)

  return (
    <div className="page schedule-page">
      <p className="page-title">{lang.title}</p>
      <div className="day-tabs">
        <button className={`day-tab ${day === 'saturday' ? 'active' : ''}`} onClick={() => setDay('saturday')}>
          {lang.sat}
        </button>
        <button className={`day-tab ${day === 'sunday' ? 'active' : ''}`} onClick={() => setDay('sunday')}>
          {lang.sun}
        </button>
      </div>

      <div className="schedule-container">
        <div className="schedule-scroll">
          {/* Timeline header */}
          <div className="timeline-header" style={{ width: totalWidth + 80 }}>
            <div style={{ width: 80, flexShrink: 0 }} />
            {hours.map(h => (
              <div key={h} className="timeline-hour" style={{ width: colWidth }}>{h}:00</div>
            ))}
          </div>

          {/* Stage rows */}
          {stages.map(stage => {
            const stageActs = acts.filter(a => a.stage === stage)
            return (
              <div key={stage} className="stage-row" style={{ width: totalWidth + 80 }}>
                <div className="stage-label" style={{ color: stageColors[stage] }}>{stage}</div>
                <div className="stage-acts" style={{ width: totalWidth, position: 'relative' }}>
                  {stageActs.map(act => {
                    const startMin = timeToMinutes(act.start) - minTime
                    const endMin = timeToMinutes(act.end) - minTime
                    const left = (startMin / 60) * colWidth
                    const width = ((endMin - startMin) / 60) * colWidth - 4
                    return (
                      <div
                        key={act.id}
                        className="act-block"
                        style={{ left, width, background: stageColors[stage] }}
                      >
                        <span className="act-name">{act.artist}</span>
                        <span className="material-icons act-heart">favorite_border</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
