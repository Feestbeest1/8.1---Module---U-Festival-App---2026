/**
 * Admin.jsx — CMS voor het ❤️U Festival
 * Bereikbaar via /admin (niet zichtbaar in de normale navigatie)
 *
 * Functies:
 *  - Login met wachtwoord (VITE_ADMIN_PASSWORD in .env)
 *  - Lineup beheren  (acts toevoegen / bewerken / verwijderen)
 *  - Festivalinfo bewerken  (teksten per taal)
 *  - Kaartmarkers bewerken  (labels & omschrijvingen)
 *
 * Data wordt opgeslagen in Firebase Firestore.
 * Als Firebase niet geconfigureerd is, wordt dat duidelijk gemeld.
 */

import { useState, useEffect, useCallback } from 'react'
import { getActs, saveActs, getFestivalInfo, saveFestivalInfo, getMarkers, saveMarkers } from '../data/db.js'
import { firebaseConfigured } from '../firebase.js'
import './Admin.css'

// ── Wachtwoord (stel in via .env → VITE_ADMIN_PASSWORD) ───────────────────
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'ufestival2026'

// ── Podiums & standaard act ────────────────────────────────────────────────
const STAGES = ['Ponton', 'The Lake', 'The Club', 'Hangar']
const DAYS   = [{ value: 'saturday', label: 'Zaterdag' }, { value: 'sunday', label: 'Zondag' }]

const EMPTY_ACT = {
  id: '', name: '', genre: '', stage: 'Ponton', day: 'saturday',
  time: '12:00', tagline: '', image: null,
  youtube: '', youtubeEmbed: '',
  bio: { nl: '', en: '', fr: '', de: '' },
}

// ════════════════════════════════════════════════════════════════════════════
//  LOGIN
// ════════════════════════════════════════════════════════════════════════════
function LoginScreen({ onLogin }) {
  const [pw, setPw] = useState('')
  const [err, setErr] = useState('')

  const handle = (e) => {
    e.preventDefault()
    if (pw === ADMIN_PASSWORD) {
      sessionStorage.setItem('adminAuth', '1')
      onLogin(true)
    } else {
      setErr('Onjuist wachtwoord')
      setPw('')
    }
  }

  return (
    <div className="admin-login">
      <div className="admin-login-card">
        <div className="admin-login-logo">
          <img src="/logo_ufestival.svg" alt="❤️U Festival" style={{ height: 48 }} />
        </div>
        <h1 className="admin-login-title">CMS Login</h1>
        <p className="admin-login-sub">❤️U Festival Beheer</p>
        <form onSubmit={handle} className="admin-login-form">
          <input
            type="password"
            className="admin-input"
            placeholder="Wachtwoord"
            value={pw}
            onChange={e => { setPw(e.target.value); setErr('') }}
            autoFocus
          />
          {err && <p className="admin-err">{err}</p>}
          <button type="submit" className="admin-btn-primary">Inloggen</button>
        </form>
        {!firebaseConfigured && (
          <div className="admin-firebase-warn">
            ⚠️ Firebase niet geconfigureerd — wijzigingen worden niet opgeslagen in de cloud.
            Stel de .env-sleutels in om het CMS volledig te activeren.
          </div>
        )}
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════════════
//  LINEUP TAB
// ════════════════════════════════════════════════════════════════════════════
function LineupTab({ acts, setActs, saving, onSave }) {
  const [filterDay, setFilterDay]   = useState('saturday')
  const [filterStage, setFilterStage] = useState('all')
  const [editAct, setEditAct]       = useState(null)   // null = gesloten
  const [editLang, setEditLang]     = useState('nl')

  const filtered = acts.filter(a =>
    a.day === filterDay && (filterStage === 'all' || a.stage === filterStage)
  ).sort((a, b) => a.time.localeCompare(b.time))

  const openNew = () => setEditAct({ ...EMPTY_ACT, id: `act_${Date.now()}` })

  const handleDelete = (id) => {
    if (!confirm('Act verwijderen?')) return
    setActs(prev => prev.filter(a => a.id !== id))
  }

  const handleSave = (act) => {
    setActs(prev => {
      const idx = prev.findIndex(a => a.id === act.id)
      return idx >= 0 ? prev.map(a => a.id === act.id ? act : a) : [...prev, act]
    })
    setEditAct(null)
  }

  return (
    <div className="admin-tab-content">
      {/* Filters */}
      <div className="admin-filters">
        <div className="admin-filter-group">
          {DAYS.map(d => (
            <button key={d.value} className={`admin-filter-btn ${filterDay === d.value ? 'active' : ''}`}
              onClick={() => setFilterDay(d.value)}>{d.label}</button>
          ))}
        </div>
        <div className="admin-filter-group">
          <button className={`admin-filter-btn ${filterStage === 'all' ? 'active' : ''}`}
            onClick={() => setFilterStage('all')}>Alle</button>
          {STAGES.map(s => (
            <button key={s} className={`admin-filter-btn ${filterStage === s ? 'active' : ''}`}
              onClick={() => setFilterStage(s)}>{s}</button>
          ))}
        </div>
      </div>

      {/* Actslijst */}
      <div className="admin-acts-list">
        {filtered.length === 0 && <p className="admin-empty">Geen acts voor deze selectie.</p>}
        {filtered.map(act => (
          <div key={act.id} className="admin-act-row">
            <div className="admin-act-info">
              <strong>{act.name || '(naamloos)'}</strong>
              <span>{act.time} · {act.stage} · {act.genre}</span>
            </div>
            <div className="admin-act-actions">
              <button className="admin-btn-icon" onClick={() => setEditAct({ ...act })}>
                <span className="material-icons">edit</span>
              </button>
              <button className="admin-btn-icon danger" onClick={() => handleDelete(act.id)}>
                <span className="material-icons">delete</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Knoppen */}
      <div className="admin-row-actions">
        <button className="admin-btn-secondary" onClick={openNew}>
          <span className="material-icons">add</span> Nieuwe act
        </button>
        <button className="admin-btn-primary" onClick={onSave} disabled={saving}>
          {saving ? 'Opslaan…' : 'Opslaan'}
        </button>
      </div>

      {/* Edit-modal */}
      {editAct && (
        <div className="admin-modal-overlay" onClick={() => setEditAct(null)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2>{editAct.name || 'Nieuwe act'}</h2>
              <button className="admin-btn-icon" onClick={() => setEditAct(null)}>
                <span className="material-icons">close</span>
              </button>
            </div>
            <div className="admin-modal-body">
              <div className="admin-form-grid">
                <label>Naam
                  <input className="admin-input" value={editAct.name}
                    onChange={e => setEditAct(p => ({ ...p, name: e.target.value }))} />
                </label>
                <label>Genre
                  <input className="admin-input" value={editAct.genre}
                    onChange={e => setEditAct(p => ({ ...p, genre: e.target.value }))} />
                </label>
                <label>Podium
                  <select className="admin-input" value={editAct.stage}
                    onChange={e => setEditAct(p => ({ ...p, stage: e.target.value }))}>
                    {STAGES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </label>
                <label>Dag
                  <select className="admin-input" value={editAct.day}
                    onChange={e => setEditAct(p => ({ ...p, day: e.target.value }))}>
                    {DAYS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                  </select>
                </label>
                <label>Tijd
                  <input type="time" className="admin-input" value={editAct.time}
                    onChange={e => setEditAct(p => ({ ...p, time: e.target.value }))} />
                </label>
                <label>YouTube ID <small>(bijv. TxvpctgU_s8)</small>
                  <input className="admin-input" value={editAct.youtubeEmbed || ''}
                    placeholder="Leeg = geen video"
                    onChange={e => setEditAct(p => ({ ...p, youtubeEmbed: e.target.value || null, youtube: e.target.value ? `https://www.youtube.com/watch?v=${e.target.value}` : '' }))} />
                </label>
              </div>

              {/* Bio per taal */}
              <div className="admin-lang-tabs">
                {['nl','en','fr','de'].map(l => (
                  <button key={l} className={`admin-lang-tab ${editLang === l ? 'active' : ''}`}
                    onClick={() => setEditLang(l)}>{l.toUpperCase()}</button>
                ))}
              </div>
              <label>Bio ({editLang.toUpperCase()})
                <textarea className="admin-input admin-textarea" rows={4}
                  value={editAct.bio?.[editLang] || ''}
                  onChange={e => setEditAct(p => ({ ...p, bio: { ...p.bio, [editLang]: e.target.value } }))} />
              </label>

              <div className="admin-modal-footer">
                <button className="admin-btn-secondary" onClick={() => setEditAct(null)}>Annuleren</button>
                <button className="admin-btn-primary" onClick={() => handleSave(editAct)}>Toepassen</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════════════
//  INFO TAB
// ════════════════════════════════════════════════════════════════════════════
function InfoTab({ info, setInfo, saving, onSave }) {
  const [lang, setLang] = useState('nl')

  const langData = info?.[lang]?.info || {}

  const updateField = (section, field, value) => {
    setInfo(prev => ({
      ...prev,
      [lang]: {
        ...prev[lang],
        info: {
          ...prev[lang]?.info,
          [section]: {
            ...prev[lang]?.info?.[section],
            [field]: value,
          },
        },
      },
    }))
  }

  const SECTIONS = [
    { key: 'general',       label: 'Algemeen & Contact', fields: ['title','content'] },
    { key: 'lockers',       label: 'Lockers',            fields: ['title','content'] },
    { key: 'golden',        label: 'Golden-GLU',         fields: ['title','content'] },
  ]

  return (
    <div className="admin-tab-content">
      <div className="admin-lang-tabs">
        {['nl','en','fr','de'].map(l => (
          <button key={l} className={`admin-lang-tab ${lang === l ? 'active' : ''}`}
            onClick={() => setLang(l)}>{l.toUpperCase()}</button>
        ))}
      </div>

      <div className="admin-info-sections">
        {SECTIONS.map(sec => (
          <div key={sec.key} className="admin-info-card">
            <h3 className="admin-info-card-title">{sec.label}</h3>
            <label>Titel
              <input className="admin-input"
                value={langData[sec.key]?.title || ''}
                onChange={e => updateField(sec.key, 'title', e.target.value)} />
            </label>
            <label>Inhoud
              <textarea className="admin-input admin-textarea" rows={5}
                value={langData[sec.key]?.content || ''}
                onChange={e => updateField(sec.key, 'content', e.target.value)} />
            </label>
          </div>
        ))}

        {/* FAQ */}
        <div className="admin-info-card">
          <h3 className="admin-info-card-title">FAQ</h3>
          <label>Titel
            <input className="admin-input"
              value={langData.faq?.title || ''}
              onChange={e => updateField('faq', 'title', e.target.value)} />
          </label>
          {(langData.faq?.items || []).map((item, i) => (
            <div key={i} className="admin-faq-item">
              <label>Vraag {i + 1}
                <input className="admin-input" value={item.q || ''}
                  onChange={e => {
                    const items = [...(langData.faq?.items || [])]
                    items[i] = { ...items[i], q: e.target.value }
                    updateField('faq', 'items', items)
                  }} />
              </label>
              <label>Antwoord {i + 1}
                <textarea className="admin-input admin-textarea" rows={2} value={item.a || ''}
                  onChange={e => {
                    const items = [...(langData.faq?.items || [])]
                    items[i] = { ...items[i], a: e.target.value }
                    updateField('faq', 'items', items)
                  }} />
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="admin-row-actions">
        <button className="admin-btn-primary" onClick={onSave} disabled={saving}>
          {saving ? 'Opslaan…' : 'Info opslaan'}
        </button>
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════════════
//  KAART TAB
// ════════════════════════════════════════════════════════════════════════════
function MapTab({ markers, setMarkers, saving, onSave }) {
  const [editLang, setEditLang] = useState('nl')

  const update = (id, field, value) => {
    setMarkers(prev => prev.map(m => m.id === id ? { ...m, [field]: value } : m))
  }

  const updateLabel = (id, lang, value) => {
    setMarkers(prev => prev.map(m =>
      m.id === id ? { ...m, label: { ...m.label, [lang]: value } } : m
    ))
  }

  const updateInfo = (id, lang, value) => {
    setMarkers(prev => prev.map(m =>
      m.id === id ? { ...m, info: { ...m.info, [lang]: value } } : m
    ))
  }

  return (
    <div className="admin-tab-content">
      <div className="admin-lang-tabs">
        {['nl','en','fr','de'].map(l => (
          <button key={l} className={`admin-lang-tab ${editLang === l ? 'active' : ''}`}
            onClick={() => setEditLang(l)}>{l.toUpperCase()}</button>
        ))}
      </div>

      <div className="admin-markers-list">
        {markers.map(m => (
          <div key={m.id} className="admin-marker-card">
            <div className="admin-marker-header">
              <div className="admin-marker-dot" style={{ background: m.color }}>
                <span className="material-icons" style={{ fontSize: 14, color: '#fff' }}>{m.icon}</span>
              </div>
              <strong>{m.id}</strong>
              <span style={{ color: '#888', fontSize: 12 }}>x:{m.x.toFixed(3)} y:{m.y.toFixed(3)}</span>
            </div>
            <label>Label ({editLang.toUpperCase()})
              <input className="admin-input"
                value={m.label?.[editLang] || ''}
                onChange={e => updateLabel(m.id, editLang, e.target.value)} />
            </label>
            <label>Omschrijving ({editLang.toUpperCase()})
              <textarea className="admin-input admin-textarea" rows={2}
                value={m.info?.[editLang] || ''}
                onChange={e => updateInfo(m.id, editLang, e.target.value)} />
            </label>
          </div>
        ))}
      </div>

      <div className="admin-row-actions">
        <button className="admin-btn-primary" onClick={onSave} disabled={saving}>
          {saving ? 'Opslaan…' : 'Kaart opslaan'}
        </button>
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════════════
//  HOOFD-COMPONENT
// ════════════════════════════════════════════════════════════════════════════
export default function Admin() {
  const [loggedIn, setLoggedIn] = useState(() => sessionStorage.getItem('adminAuth') === '1')
  const [tab, setTab]           = useState('lineup')

  // Data-states
  const [acts,    setActs]    = useState([])
  const [info,    setInfo]    = useState({})
  const [markers, setMarkers] = useState([])

  // UI-states
  const [loading, setLoading] = useState(false)
  const [saving,  setSaving]  = useState(false)
  const [toast,   setToast]   = useState(null)

  const showToast = (msg, type = 'ok') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  // Data laden zodra ingelogd
  useEffect(() => {
    if (!loggedIn) return
    setLoading(true)
    Promise.all([getActs(), getFestivalInfo(), getMarkers()])
      .then(([a, i, m]) => { setActs(a); setInfo(i); setMarkers(m) })
      .catch(e => showToast('Fout bij laden: ' + e.message, 'err'))
      .finally(() => setLoading(false))
  }, [loggedIn])

  const handleSaveActs = useCallback(async () => {
    setSaving(true)
    try { await saveActs(acts); showToast('Lineup opgeslagen ✓') }
    catch (e) { showToast('Fout: ' + e.message, 'err') }
    finally { setSaving(false) }
  }, [acts])

  const handleSaveInfo = useCallback(async () => {
    setSaving(true)
    try { await saveFestivalInfo(info); showToast('Info opgeslagen ✓') }
    catch (e) { showToast('Fout: ' + e.message, 'err') }
    finally { setSaving(false) }
  }, [info])

  const handleSaveMarkers = useCallback(async () => {
    setSaving(true)
    try { await saveMarkers(markers); showToast('Kaart opgeslagen ✓') }
    catch (e) { showToast('Fout: ' + e.message, 'err') }
    finally { setSaving(false) }
  }, [markers])

  const handleLogout = () => {
    sessionStorage.removeItem('adminAuth')
    setLoggedIn(false)
  }

  if (!loggedIn) return <LoginScreen onLogin={setLoggedIn} />

  const TABS = [
    { id: 'lineup',  label: 'Lineup',  icon: 'music_note' },
    { id: 'info',    label: 'Info',    icon: 'info' },
    { id: 'markers', label: 'Kaart',   icon: 'map' },
  ]

  return (
    <div className="admin-wrap">
      {/* Header */}
      <header className="admin-header">
        <div className="admin-header-left">
          <img src="/logo_ufestival.svg" alt="❤️U" style={{ height: 32 }} />
          <span className="admin-header-title">CMS</span>
        </div>
        <div className="admin-header-right">
          {!firebaseConfigured && (
            <span className="admin-no-firebase">⚠️ Firebase niet actief</span>
          )}
          <button className="admin-logout-btn" onClick={handleLogout}>
            <span className="material-icons">logout</span>
          </button>
        </div>
      </header>

      {/* Tab-navigatie */}
      <nav className="admin-tabs">
        {TABS.map(t => (
          <button key={t.id} className={`admin-tab ${tab === t.id ? 'active' : ''}`}
            onClick={() => setTab(t.id)}>
            <span className="material-icons">{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </nav>

      {/* Content */}
      <main className="admin-main">
        {loading ? (
          <div className="admin-loading">
            <span className="material-icons admin-spin">sync</span>
            <p>Data laden…</p>
          </div>
        ) : (
          <>
            {tab === 'lineup'  && <LineupTab  acts={acts}    setActs={setActs}       saving={saving} onSave={handleSaveActs} />}
            {tab === 'info'    && <InfoTab    info={info}    setInfo={setInfo}       saving={saving} onSave={handleSaveInfo} />}
            {tab === 'markers' && <MapTab     markers={markers} setMarkers={setMarkers} saving={saving} onSave={handleSaveMarkers} />}
          </>
        )}
      </main>

      {/* Toast-melding */}
      {toast && (
        <div className={`admin-toast ${toast.type === 'err' ? 'err' : ''}`}>
          <span className="material-icons">{toast.type === 'err' ? 'error' : 'check_circle'}</span>
          {toast.msg}
        </div>
      )}
    </div>
  )
}
