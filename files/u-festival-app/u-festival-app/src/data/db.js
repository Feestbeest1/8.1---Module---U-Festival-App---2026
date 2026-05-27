/**
 * db.js — Centrale datalayer voor het CMS
 *
 * Leest uit Firebase Firestore als dat geconfigureerd is.
 * Valt anders terug op de statische data-bestanden.
 *
 * Firestore-structuur:
 *   festival/acts     → { items: [...] }
 *   festival/info     → { nl: {...}, en: {...}, fr: {...}, de: {...} }
 *   festival/markers  → { items: [...] }
 */

import { db, firebaseConfigured } from '../firebase.js'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { acts as staticActs }            from './acts.js'
import { festivalData as staticInfo }    from './festival.js'
import { markers as staticMarkers }      from './markers.js'

// ── Generieke lees/schrijf helpers ─────────────────────────────────────────

async function readDoc(path, field) {
  if (!firebaseConfigured) return null
  try {
    const snap = await getDoc(doc(db, ...path.split('/')))
    if (snap.exists()) return snap.data()[field] ?? null
  } catch (e) { console.warn('Firebase leesfout:', e.message) }
  return null
}

async function writeDoc(path, data) {
  if (!firebaseConfigured) throw new Error('Firebase niet geconfigureerd')
  await setDoc(doc(db, ...path.split('/')), data, { merge: true })
}

// ── Acts (line-up / blokschema) ────────────────────────────────────────────

export async function getActs() {
  const items = await readDoc('festival/acts', 'items')
  return items ?? staticActs
}

export async function saveActs(items) {
  await writeDoc('festival/acts', { items })
}

// ── Festivalinfo ───────────────────────────────────────────────────────────

export async function getFestivalInfo() {
  const info = await readDoc('festival/info', 'data')
  return info ?? staticInfo
}

export async function saveFestivalInfo(data) {
  await writeDoc('festival/info', { data })
}

// ── Kaartmarkers ───────────────────────────────────────────────────────────

export async function getMarkers() {
  const items = await readDoc('festival/markers', 'items')
  return items ?? staticMarkers
}

export async function saveMarkers(items) {
  await writeDoc('festival/markers', { items })
}
