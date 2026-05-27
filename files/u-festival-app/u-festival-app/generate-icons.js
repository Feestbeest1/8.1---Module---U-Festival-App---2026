/**
 * generate-icons.js
 * Genereert PWA-icons (192x192 en 512x512 PNG) voor de ❤️U Festival app.
 * Run met: node generate-icons.js
 */
import { deflateSync } from 'node:zlib'
import { writeFileSync } from 'node:fs'

// ── CRC32 voor PNG-chunks ────────────────────────────────────────────────────
const CRC_TABLE = (() => {
  const t = new Uint32Array(256)
  for (let i = 0; i < 256; i++) {
    let c = i
    for (let j = 0; j < 8; j++) c = (c & 1) ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    t[i] = c
  }
  return t
})()

function crc32(buf) {
  let crc = 0xffffffff
  for (const byte of buf) crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8)
  return (crc ^ 0xffffffff) >>> 0
}

function pngChunk(type, data) {
  const typeB = Buffer.from(type, 'ascii')
  const lenB  = Buffer.alloc(4); lenB.writeUInt32BE(data.length)
  const crcB  = Buffer.alloc(4); crcB.writeUInt32BE(crc32(Buffer.concat([typeB, data])))
  return Buffer.concat([lenB, typeB, data, crcB])
}

// ── PNG bouwen ───────────────────────────────────────────────────────────────
function makePNG(size, pixelFn) {
  const PNG_SIG = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])

  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)   // width
  ihdr.writeUInt32BE(size, 4)   // height
  ihdr[8] = 8  // bit depth
  ihdr[9] = 2  // color type: RGB

  const rows = []
  for (let y = 0; y < size; y++) {
    const row = Buffer.alloc(1 + size * 3)
    row[0] = 0  // filter = None
    for (let x = 0; x < size; x++) {
      const [r, g, b] = pixelFn(x, y, size)
      row[1 + x * 3]     = r
      row[1 + x * 3 + 1] = g
      row[1 + x * 3 + 2] = b
    }
    rows.push(row)
  }

  const idat = deflateSync(Buffer.concat(rows))

  return Buffer.concat([
    PNG_SIG,
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', idat),
    pngChunk('IEND', Buffer.alloc(0)),
  ])
}

// ── Iconontwerp ──────────────────────────────────────────────────────────────
// Zwarte achtergrond, rood afgerond vierkant (festival-rood), wit hart-symbool
function drawIcon(x, y, size) {
  const BLACK = [0, 0, 0]
  const RED   = [240, 50, 40]    // #F03228
  const WHITE = [255, 255, 255]

  const cx = size / 2, cy = size / 2

  // --- Afgerond vierkant (rode achtergrond) ---
  const pad = size * 0.08
  const cr  = size * 0.18   // corner radius
  const x1 = pad, y1 = pad, x2 = size - pad, y2 = size - pad

  let inRect = false
  if (x >= x1 && x <= x2 && y >= y1 && y <= y2) {
    const inTopLeft     = x < x1 + cr && y < y1 + cr
    const inTopRight    = x > x2 - cr && y < y1 + cr
    const inBotLeft     = x < x1 + cr && y > y2 - cr
    const inBotRight    = x > x2 - cr && y > y2 - cr

    if (inTopLeft)     inRect = dist(x, y, x1 + cr, y1 + cr) <= cr
    else if (inTopRight)  inRect = dist(x, y, x2 - cr, y1 + cr) <= cr
    else if (inBotLeft)   inRect = dist(x, y, x1 + cr, y2 - cr) <= cr
    else if (inBotRight)  inRect = dist(x, y, x2 - cr, y2 - cr) <= cr
    else inRect = true
  }

  if (!inRect) return BLACK

  // --- Hart (wit) ---
  // Hart bestaat uit twee cirkels bovenaan + een driehoek onderin
  const hs = size * 0.18   // hart-schaal
  const hcy = cy - size * 0.04  // hart-middelpunt (iets omhoog)

  const lx = cx - hs * 0.5, rx = cx + hs * 0.5, ty = hcy - hs * 0.3

  const inLeftCircle  = dist(x, y, lx, ty) <= hs * 0.55
  const inRightCircle = dist(x, y, rx, ty) <= hs * 0.55

  // Driehoek-gedeelte van het hart
  const tip = { x: cx, y: hcy + hs * 1.1 }
  const tl  = { x: cx - hs, y: hcy }
  const tr  = { x: cx + hs, y: hcy }
  const inTriangle = pointInTriangle(x, y, tl, tr, tip)

  if (inLeftCircle || inRightCircle || inTriangle) return WHITE

  // --- Letter U (zwart) onder het hart ---
  // Simpele balk-U: twee verticale staven + verbindende boog
  const uy = hcy + hs * 1.3   // boven-rand U
  const uh = size * 0.18       // hoogte U
  const uw = size * 0.22       // breedte U
  const ut = size * 0.04       // dikte U-strepen

  const inULeft  = x >= cx - uw/2 && x <= cx - uw/2 + ut && y >= uy && y <= uy + uh
  const inURight = x >= cx + uw/2 - ut && x <= cx + uw/2 && y >= uy && y <= uy + uh
  const inUBot   = y >= uy + uh - ut && y <= uy + uh && x >= cx - uw/2 && x <= cx + uw/2
  if (inULeft || inURight || inUBot) return BLACK

  return RED
}

function dist(x1, y1, x2, y2) {
  return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2)
}

function sign(p1, p2, p3) {
  return (p1.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p1.y - p3.y)
}

function pointInTriangle(px, py, v1, v2, v3) {
  const p = { x: px, y: py }
  const d1 = sign(p, v1, v2)
  const d2 = sign(p, v2, v3)
  const d3 = sign(p, v3, v1)
  const hasNeg = d1 < 0 || d2 < 0 || d3 < 0
  const hasPos = d1 > 0 || d2 > 0 || d3 > 0
  return !(hasNeg && hasPos)
}

// ── Genereer icons ──────────────────────────────────────────────────────────
for (const size of [192, 512]) {
  const buf = makePNG(size, drawIcon)
  writeFileSync(`public/icon-${size}.png`, buf)
  console.log(`✓ public/icon-${size}.png  (${(buf.length / 1024).toFixed(1)} KB)`)
}
console.log('\nPWA icons klaar! Herstart de dev-server als hij al draait.')
