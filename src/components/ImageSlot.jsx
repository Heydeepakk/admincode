import React, { useEffect, useRef, useState } from 'react'
import { removeBackground } from '../utils/removeBackground'

// One photo slot (front or back): pick/take a photo, preview the cut-out on a checkerboard.
// value: { file, existingUrl, cutout: { cut, blob, url, reason } | null, removeBg }
const ImageSlot = ({ label, hint, value, onChange, required }) => {
  const [busy, setBusy] = useState(false)
  const inputRef = useRef(null)
  const { file, existingUrl, cutout, removeBg } = value

  const originalUrl = useObjectUrl(file)

  const pick = async (f) => {
    if (!f) return
    onChange({ ...value, file: f, cutout: null })
    setBusy(true)
    try {
      const result = await removeBackground(f)
      onChange({ ...value, file: f, cutout: result })
    } catch (err) {
      onChange({ ...value, file: f, cutout: { cut: false, reason: err.message } })
    } finally {
      setBusy(false)
    }
  }

  const showCut = removeBg && cutout?.cut
  const preview = showCut ? cutout.url : originalUrl || existingUrl
  const hasImage = Boolean(preview)

  return (
    <div className='flex flex-col gap-2 min-w-0'>
      <div className='flex items-baseline justify-between gap-2'>
        <p className='text-sm font-semibold text-gray-800'>{label}{required && <span className='text-red-500'> *</span>}</p>
        {hint && <p className='text-[11px] text-gray-400 truncate'>{hint}</p>}
      </div>

      <button type='button' onClick={() => inputRef.current?.click()}
        className={`relative aspect-[4/5] w-full rounded-2xl overflow-hidden border-2 transition-colors ${hasImage ? 'border-gray-200 checkerboard' : 'border-dashed border-gray-300 bg-white hover:border-gray-500'}`}>
        {hasImage ? (
          <img src={preview} alt={label} className='absolute inset-0 w-full h-full object-contain p-2' />
        ) : (
          <span className='absolute inset-0 flex flex-col items-center justify-center gap-2 text-gray-400'>
            <svg viewBox='0 0 24 24' className='w-9 h-9' fill='none' stroke='currentColor' strokeWidth='1.5'>
              <path d='M3 7h3l2-3h8l2 3h3v12H3z' /><circle cx='12' cy='13' r='4' />
            </svg>
            <span className='text-xs font-medium'>Tap to add photo</span>
          </span>
        )}
        {busy && (
          <span className='absolute inset-0 bg-white/80 flex flex-col items-center justify-center gap-2 text-xs text-gray-600'>
            <span className='w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin' />
            Removing background…
          </span>
        )}
      </button>
      <input ref={inputRef} type='file' accept='image/*' hidden onChange={e => { pick(e.target.files[0]); e.target.value = '' }} />

      {file && !busy && cutout && (
        cutout.cut ? (
          <label className='flex items-center gap-2 text-xs text-gray-600 cursor-pointer select-none'>
            <input type='checkbox' checked={removeBg} onChange={e => onChange({ ...value, removeBg: e.target.checked })} className='w-4 h-4 accent-black' />
            Remove background
          </label>
        ) : (
          <p className='text-[11px] leading-snug text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2 py-1.5'>{cutout.reason}</p>
        )
      )}

      {hasImage && !busy && (
        <div className='flex gap-2'>
          <button type='button' onClick={() => inputRef.current?.click()} className='flex-1 text-xs py-2 rounded-lg border border-gray-300 bg-white hover:border-gray-500'>Change</button>
          {!required && (
            <button type='button' onClick={() => onChange({ ...value, file: null, existingUrl: '', cutout: null })}
              className='flex-1 text-xs py-2 rounded-lg border border-red-200 text-red-600 bg-white hover:bg-red-50'>Remove</button>
          )}
        </div>
      )}
    </div>
  )
}

const useObjectUrl = (file) => {
  const [url, setUrl] = useState('')
  useEffect(() => {
    if (!file) { setUrl(''); return }
    const u = URL.createObjectURL(file)
    setUrl(u)
    return () => URL.revokeObjectURL(u)
  }, [file])
  return url
}

export default ImageSlot
