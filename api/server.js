import express from 'express'
import cors from 'cors'
import mysql from 'mysql2/promise'

const app  = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json({ limit: '2mb' }))

// ── MySQL verbinding pool ──────────────────────────────────────────────────
const pool = mysql.createPool({
  host:     process.env.DB_HOST     || 'mysql',
  port:     Number(process.env.DB_PORT) || 3306,
  user:     process.env.DB_USER     || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME     || 'ufestival',
  waitForConnections: true,
  connectionLimit:    10,
})

// Wacht tot MySQL beschikbaar is (retries bij opstarten)
async function waitForDB(retries = 10) {
  for (let i = 0; i < retries; i++) {
    try {
      const conn = await pool.getConnection()
      conn.release()
      console.log('✅ MySQL verbonden')
      return
    } catch {
      console.log(`⏳ Wacht op MySQL… (${i + 1}/${retries})`)
      await new Promise(r => setTimeout(r, 2000))
    }
  }
  console.error('❌ MySQL niet bereikbaar na meerdere pogingen')
  process.exit(1)
}

// Tabel aanmaken als die nog niet bestaat
async function initDB() {
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS cms_data (
      \`key\`      VARCHAR(100) PRIMARY KEY,
      \`value\`    JSON         NOT NULL,
      updated_at   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `)
  console.log('✅ Tabel cms_data klaar')
}

// ── Routes ─────────────────────────────────────────────────────────────────

// GET /api/cms/:key — lees een waarde op
app.get('/api/cms/:key', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT `value` FROM cms_data WHERE `key` = ?',
      [req.params.key]
    )
    if (rows.length === 0) return res.status(404).json({ error: 'Niet gevonden' })
    res.json({ value: rows[0].value })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// PUT /api/cms/:key — sla een waarde op (upsert)
app.put('/api/cms/:key', async (req, res) => {
  const { value } = req.body
  console.log(`💾 Opslaan: ${req.params.key}`)
  if (value === undefined) return res.status(400).json({ error: 'value ontbreekt' })
  try {
    await pool.execute(
      'INSERT INTO cms_data (`key`, `value`) VALUES (?, ?) ON DUPLICATE KEY UPDATE `value` = ?, updated_at = NOW()',
      [req.params.key, JSON.stringify(value), JSON.stringify(value)]
    )
    console.log(`✅ Opgeslagen: ${req.params.key}`)
    res.json({ ok: true })
  } catch (e) {
    console.error(`❌ MySQL fout: ${e.message}`)
    res.status(500).json({ error: e.message })
  }
})

// Health check
app.get('/api/health', (_, res) => res.json({ status: 'ok' }))

// ── Start ──────────────────────────────────────────────────────────────────
await waitForDB()
await initDB()
app.listen(PORT, () => console.log(`🚀 API draait op poort ${PORT}`))
