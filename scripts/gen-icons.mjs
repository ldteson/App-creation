// One-off generator for public/icons/*. Regenerate with:
//   npm install -D sharp && node scripts/gen-icons.mjs && npm uninstall sharp
import sharp from 'sharp'
import { mkdirSync } from 'node:fs'

mkdirSync('public/icons', { recursive: true })

function ring(cx, cy, r) {
  return { cx, cy, r }
}

// Three overlapping discipline circles (swim/bike/run) around a center point.
function iconSvg({ size, safe }) {
  const c = size / 2
  const R = safe ? size * 0.176 : size * 0.195 // distance from center to each circle
  const r = safe ? size * 0.225 : size * 0.25 // circle radius
  const top = ring(c, c - R, r)
  const right = ring(c + R * 0.866, c + R * 0.5, r)
  const left = ring(c - R * 0.866, c + R * 0.5, r)
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="#0b0d12" />
  <g style="mix-blend-mode:screen" opacity="0.92">
    <circle cx="${top.cx}" cy="${top.cy}" r="${top.r}" fill="#38bdf8" />
    <circle cx="${right.cx}" cy="${right.cy}" r="${right.r}" fill="#a78bfa" />
    <circle cx="${left.cx}" cy="${left.cy}" r="${left.r}" fill="#4ade80" />
  </g>
</svg>`.trim()
}

const targets = [
  { file: 'public/icons/icon-192.png', size: 192, safe: false },
  { file: 'public/icons/icon-512.png', size: 512, safe: false },
  { file: 'public/icons/maskable-192.png', size: 192, safe: true },
  { file: 'public/icons/maskable-512.png', size: 512, safe: true },
  { file: 'public/icons/apple-touch-icon.png', size: 180, safe: true },
]

for (const t of targets) {
  const svg = iconSvg(t)
  await sharp(Buffer.from(svg)).png().toFile(t.file)
  console.log('wrote', t.file)
}
