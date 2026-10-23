// draws resources/icon.png from the web favicon: the 16x16 pixel art scaled up with no smoothing.
// run it by hand after the logo glyphs or theme change: node apps/electron/scripts/make-icon.mjs
import { readFileSync, writeFileSync } from 'node:fs'
import { deflateSync } from 'node:zlib'

const SIZE = 1024
const svg = readFileSync(new URL('../../web/public/favicon.svg', import.meta.url), 'utf8')
const unit = SIZE / 16

const pixels = Buffer.alloc(SIZE * SIZE * 4)
const paint = (x, y, w, h, hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16))
  for (let py = y * unit; py < (y + h) * unit; py++) {
    for (let px = x * unit; px < (x + w) * unit; px++) {
      pixels.set([r, g, b, 255], (py * SIZE + px) * 4)
    }
  }
}
for (const [, attrs] of svg.matchAll(/<rect ([^>]*)\/>/g)) {
  const get = (name) => attrs.match(new RegExp(`${name}="([^"]+)"`))?.[1]
  paint(
    Number(get('x') ?? 0),
    Number(get('y') ?? 0),
    Number(get('width')),
    Number(get('height')),
    get('fill'),
  )
}

const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  return c >>> 0
})
const crc = (buf) => {
  let c = 0xffffffff
  for (const byte of buf) c = crcTable[(c ^ byte) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}
const chunk = (type, data) => {
  const body = Buffer.concat([Buffer.from(type), data])
  const out = Buffer.alloc(body.length + 8)
  out.writeUInt32BE(data.length, 0)
  body.copy(out, 4)
  out.writeUInt32BE(crc(body), body.length + 4)
  return out
}

const header = Buffer.alloc(13)
header.writeUInt32BE(SIZE, 0)
header.writeUInt32BE(SIZE, 4)
header.set([8, 6, 0, 0, 0], 8) // 8 bit rgba
const rows = Buffer.alloc((SIZE * 4 + 1) * SIZE)
for (let y = 0; y < SIZE; y++)
  pixels.copy(rows, y * (SIZE * 4 + 1) + 1, y * SIZE * 4, (y + 1) * SIZE * 4)

writeFileSync(
  new URL('../resources/icon.png', import.meta.url),
  Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', header),
    chunk('IDAT', deflateSync(rows)),
    chunk('IEND', Buffer.alloc(0)),
  ]),
)
