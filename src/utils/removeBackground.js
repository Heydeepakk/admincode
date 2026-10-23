// Removes a plain white / light-grey studio background from a product photo, in the browser,
// and crops to the garment. Flood-fills from the photo border, so white areas inside the
// garment are kept. Photos without a plain backdrop come back with cut: false.

const MAX_SIDE = 1400

const isBackground = (d, i) => {
  const r = d[i], g = d[i + 1], b = d[i + 2], a = d[i + 3]
  if (a < 24) return true
  const min = Math.min(r, g, b), max = Math.max(r, g, b)
  return min > 212 && max - min < 24
}

const loadImage = src => new Promise((resolve, reject) => {
  const img = new Image()
  img.onload = () => resolve(img)
  img.onerror = () => reject(new Error('Could not read this image'))
  img.src = src
})

const toBlob = canvas => new Promise(r => canvas.toBlob(r, 'image/png'))

export const removeBackground = async (file) => {
  const url = URL.createObjectURL(file)
  try {
    const img = await loadImage(url)
    const scale = Math.min(1, MAX_SIDE / Math.max(img.naturalWidth, img.naturalHeight))
    const w = Math.round(img.naturalWidth * scale), h = Math.round(img.naturalHeight * scale)
    const canvas = document.createElement('canvas')
    canvas.width = w; canvas.height = h
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    ctx.drawImage(img, 0, 0, w, h)
    const imageData = ctx.getImageData(0, 0, w, h)
    const d = imageData.data

    const border = []
    for (let x = 0; x < w; x++) border.push(x, (h - 1) * w + x)
    for (let y = 1; y < h - 1; y++) border.push(y * w, y * w + w - 1)
    const bg = border.filter(p => isBackground(d, p * 4)).length
    if (bg / border.length < 0.6) return { cut: false, reason: 'The background is not plain white, so it was kept.' }

    const mask = new Uint8Array(w * h)
    const stack = new Int32Array(w * h)
    let sp = 0
    for (const p of border) if (!mask[p] && isBackground(d, p * 4)) { mask[p] = 1; stack[sp++] = p }
    while (sp) {
      const p = stack[--sp]
      const x = p % w
      for (const q of [x > 0 ? p - 1 : -1, x < w - 1 ? p + 1 : -1, p - w, p + w]) {
        if (q < 0 || q >= w * h || mask[q]) continue
        if (isBackground(d, q * 4)) { mask[q] = 1; stack[sp++] = q }
      }
    }

    let kept = 0, minX = w, minY = h, maxX = 0, maxY = 0
    for (let p = 0; p < w * h; p++) {
      const i = p * 4
      if (mask[p]) { d[i + 3] = 0; continue }
      const x = p % w
      // soften the light halo along the cut edge
      if ((x > 0 && mask[p - 1]) || (x < w - 1 && mask[p + 1]) || mask[p - w] || mask[p + w]) {
        const light = Math.min(d[i], d[i + 1], d[i + 2])
        if (light > 170) d[i + 3] = Math.max(40, 255 - (light - 170) * 2.4)
      }
      kept++
      const y = (p - x) / w
      if (x < minX) minX = x; if (x > maxX) maxX = x
      if (y < minY) minY = y; if (y > maxY) maxY = y
    }
    if (kept / (w * h) < 0.08 || kept / ((maxX - minX + 1) * (maxY - minY + 1)) < 0.3) {
      return { cut: false, reason: 'The garment is too close to the background colour, so the photo was kept as is. Try a darker or plain white backdrop.' }
    }

    ctx.putImageData(imageData, 0, 0)
    const pad = Math.round(Math.max(maxX - minX, maxY - minY) * 0.02)
    const sx = Math.max(0, minX - pad), sy = Math.max(0, minY - pad)
    const cw = Math.min(w, maxX + pad + 1) - sx, ch = Math.min(h, maxY + pad + 1) - sy
    const out = document.createElement('canvas')
    out.width = cw; out.height = ch
    out.getContext('2d').drawImage(canvas, sx, sy, cw, ch, 0, 0, cw, ch)
    const blob = await toBlob(out)
    if (!blob) return { cut: false, reason: 'Your browser could not export the cut-out.' }
    return { cut: true, blob, url: URL.createObjectURL(blob) }
  } finally {
    URL.revokeObjectURL(url)
  }
}
