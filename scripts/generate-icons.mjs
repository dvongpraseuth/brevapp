import { deflateSync } from 'zlib'
import { writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

function u32(n) {
  const b = Buffer.allocUnsafe(4)
  b.writeUInt32BE(n)
  return b
}

function crc32(buf) {
  const table = new Uint32Array(256).map((_, i) => {
    let c = i
    for (let j = 0; j < 8; j++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    return c
  })
  let crc = 0xffffffff
  for (const byte of buf) crc = table[(crc ^ byte) & 0xff] ^ (crc >>> 8)
  return (crc ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const typeB = Buffer.from(type)
  const crcBuf = Buffer.concat([typeB, data])
  return Buffer.concat([u32(data.length), typeB, data, u32(crc32(crcBuf))])
}

function makePNG(size, r, g, b) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])

  const ihdr = Buffer.allocUnsafe(13)
  ihdr.writeUInt32BE(size, 0)   // width
  ihdr.writeUInt32BE(size, 4)   // height
  ihdr[8]  = 8   // bit depth
  ihdr[9]  = 2   // color type: RGB
  ihdr[10] = 0   // compression
  ihdr[11] = 0   // filter
  ihdr[12] = 0   // interlace

  // Raw image data: filter byte + RGB per row
  const row = Buffer.allocUnsafe(1 + size * 3)
  row[0] = 0 // filter type None
  for (let x = 0; x < size; x++) {
    row[1 + x * 3]     = r
    row[1 + x * 3 + 1] = g
    row[1 + x * 3 + 2] = b
  }
  const raw = Buffer.concat(Array(size).fill(row))
  const idat = deflateSync(raw)

  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

const out = join(__dirname, '..', 'public')
mkdirSync(out, { recursive: true })

// Brand color: #1C1917 (dark stone)
writeFileSync(join(out, 'icon-192.png'), makePNG(192, 0x1c, 0x19, 0x17))
writeFileSync(join(out, 'icon-512.png'), makePNG(512, 0x1c, 0x19, 0x17))

console.log('✅ icon-192.png et icon-512.png générés dans public/')
