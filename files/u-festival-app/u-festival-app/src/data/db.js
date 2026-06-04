/**
 * db.js — Centrale datalayer voor het CMS
 *
 * Volgorde bij lezen:  localStorage → MySQL API
 * Volgorde bij schrijven: localStorage + MySQL API tegelijk
 *
 * De MySQL API draait op /api/cms/:key (Express, zie /api/server.js)
 */

import { acts as staticActs }         from './acts.js'
import { festivalData as staticInfo }  from './festival.js'
import { markers as staticMarkers }    from './markers.js'

// API base URL: in productie zelfde origin, lokaal via env
const API = import.meta.env.VITE_API_URL || ''

// ── localStorage helpers ───────────────────────────────────────────────────
const LS = 'ufestival_cms_'
const lsKey = (key) => `${LS}${key}`

function lsRead(key) {
  try {
    const v = localStorage.getItem(lsKey(key))
    return v ? JSON.parse(v) : null
  } catch { return null }
}

function lsWrite(key, value) {
  try {
    localStorage.setItem(lsKey(key), JSON.stringify(value))
  } catch (e) { console.warn('localStorage schrijffout:', e.message) }
}

// ── API helpers ────────────────────────────────────────────────────────────

async function apiRead(key) {
  try {
    const res = await fetch(`${API}/api/cms/${key}`)
    if (!res.ok) return null
    const json = await res.json()
    return json.value ?? null
  } catch { return null }
}

async function apiWrite(key, value) {
  const res = await fetch(`${API}/api/cms/${key}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ value }),
  })
  if (!res.ok) throw new Error(`API fout: ${res.status}`)
  const ct = res.headers.get('content-type') || ''
  if (!ct.includes('application/json')) throw new Error('API niet bereikbaar — start Docker')
}

// ── Generieke lees/schrijf ─────────────────────────────────────────────────

async function dbRead(key) {
  // 1. localStorage (direct, ook offline)
  const local = lsRead(key)
  if (local !== null) return local
  // 2. MySQL via API
  const remote = await apiRead(key)
  if (remote !== null) {
    lsWrite(key, remote)
    return remote
  }
  return null
}

async function dbWrite(key, value) {
  lsWrite(key, value)
  await apiWrite(key, value)  // gooit fout als MySQL niet reageert
}

// ── Publieke API ───────────────────────────────────────────────────────────

export async function getActs() {
  const items = await dbRead('acts')
  return items ?? staticActs
}

export async function saveActs(items) {
  await dbWrite('acts', items)
}

export async function getFestivalInfo() {
  const data = await dbRead('festival_info')
  return data ?? staticInfo
}

export async function saveFestivalInfo(data) {
  await dbWrite('festival_info', data)
}

export async function getMarkers() {
  const items = await dbRead('markers')
  return items ?? staticMarkers
}

export async function saveMarkers(items) {
  await dbWrite('markers', items)
}
