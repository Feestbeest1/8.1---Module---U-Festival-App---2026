/**
 * supabase.js — Supabase configuratie
 *
 * Vul in via .env:
 *   VITE_SUPABASE_URL=https://xxxx.supabase.co
 *   VITE_SUPABASE_ANON_KEY=eyJhbGci...
 *
 * Of vervang de lege strings hieronder direct.
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL       || ''
const supabaseKey  = import.meta.env.VITE_SUPABASE_ANON_KEY  || ''

export const supabaseConfigured = Boolean(supabaseUrl && supabaseKey)

export const supabase = supabaseConfigured
  ? createClient(supabaseUrl, supabaseKey)
  : null
