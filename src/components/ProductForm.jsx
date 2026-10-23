import React, { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { Link, useNavigate } from 'react-router-dom'
import { backendUrl } from '../App'
import ImageSlot from './ImageSlot'
import { HANGERS, hangerOf } from '../utils/hangers'

const CLOUDINARY_CLOUD = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const CLOUDINARY_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

const emptySlot = (existingUrl = '') => ({ file: null, existingUrl, cutout: null, removeBg: true })

const uploadToCloudinary = async (file) => {
  const data = new FormData()
  data.append('file', file)
  data.append('upload_preset', CLOUDINARY_PRESET)
  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`, { method: 'POST', body: data })
  const json = await res.json()
  if (!json.secure_url) throw new Error(json.error?.message || 'Image upload failed')
  return json.secure_url
}

// uploads the cut-out when there is one, otherwise the original photo; keeps the old URL if unchanged
const resolveSlot = async (slot, name) => {
  if (slot.file) {
    const useCut = slot.removeBg && slot.cutout?.cut
    const file = useCut ? new File([slot.cutout.blob], `${name}.png`, { type: 'image/png' }) : slot.file
    return uploadToCloudinary(file)
  }
  return slot.existingUrl || ''
}

// older products stored the description as HTML from the rich-text editor
const htmlToText = html => String(html || '')
  .replace(/<\/(p|div|li|h\d)>|<br\s*\/?>/gi, '\n')
  .replace(/<[^>]+>/g, '')
  .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/\n{3,}/g, '\n\n').trim()

const ProductForm = ({ token, productId }) => {
  const navigate = useNavigate()
  const editing = Boolean(productId)
  const [front, setFront] = useState(emptySlot())
  const [back, setBack] = useState(emptySlot())
  const [left, setLeft] = useState(emptySlot())
  const [right, setRight] = useState(emptySlot())
  const [extraImages, setExtraImages] = useState([])
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState('')
  const [sizes, setSizes] = useState([])
  const [description, setDescription] = useState('')
  const [bestseller, setBestseller] = useState(false)
  const [categories, setCategories] = useState([])
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(editing)

  useEffect(() => {
    axios.get(backendUrl + '/api/category/list')
      .then(r => r.data.success && setCategories(r.data.categories))
      .catch(err => toast.error(err.message))
  }, [])

  useEffect(() => {
    if (!editing) return
    axios.post(backendUrl + '/api/product/single', { productId })
      .then(({ data }) => {
        if (!data.success) { toast.error(data.message); return }
        const p = data.product
        setName(p.name || '')
        setPrice(p.price ?? '')
        setCategory(p.category?._id || p.category || '')
        setDescription(htmlToText(p.description))
        setBestseller(Boolean(p.bestseller))
        setFront(emptySlot(p.image?.[0] || ''))
        setBack(emptySlot(p.image?.[1] || ''))
        setLeft(emptySlot(p.sideImages?.left || ''))
        setRight(emptySlot(p.sideImages?.right || ''))
        setExtraImages((p.image || []).slice(2))
        // products made with the old attribute system: carry their sizes over
        const fromVariants = (p.variants || []).flatMap(v => v.attributes || [])
          .filter(a => /size/i.test(a.attributeName || '')).map(a => a.variantValue)
        setSizes([...new Set([...(p.sizes || []), ...fromVariants])])
      })
      .catch(err => toast.error(err.message))
      .finally(() => setLoading(false))
  }, [editing, productId])

  const selectedCategory = categories.find(c => c._id === category)
  const hanger = selectedCategory ? hangerOf(selectedCategory) : null
  const sizeOptions = useMemo(() => [...new Set([...(hanger ? HANGERS[hanger].sizes : HANGERS.tshirt.sizes), ...sizes])], [hanger, sizes])

  const toggleSize = s => setSizes(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!front.file && !front.existingUrl) { toast.error('Please add the front photo'); return }
    if (!category) { toast.error('Please choose a category'); return }
    setSaving(true)
    try {
      const [frontUrl, backUrl, leftUrl, rightUrl] = await Promise.all([
        resolveSlot(front, 'front'), resolveSlot(back, 'back'), resolveSlot(left, 'left'), resolveSlot(right, 'right'),
      ])
      const body = {
        name: name.trim(),
        price,
        category,
        description: description.trim(),
        sizes,
        bestseller,
        variants: [], // the attribute/variant system is retired; sizes cover it
        imageUrls: [frontUrl, backUrl, ...extraImages].filter(Boolean),
        sideImages: { left: leftUrl, right: rightUrl },
      }
      const { data } = editing
        ? await axios.post(backendUrl + '/api/product/update', { id: productId, ...body }, { headers: { token } })
        : await axios.post(backendUrl + '/api/product/add', body, { headers: { token } })

      if (!data.success) { toast.error(data.message); return }
      toast.success(data.message)
      if (editing) navigate('/list')
      else {
        setFront(emptySlot()); setBack(emptySlot()); setLeft(emptySlot()); setRight(emptySlot()); setExtraImages([])
        setName(''); setPrice(''); setDescription(''); setSizes([]); setBestseller(false)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    } catch (err) {
      console.log(err)
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p className='text-sm text-gray-500 py-10 text-center'>Loading product…</p>

  return (
    <form onSubmit={onSubmit} className='w-full max-w-3xl flex flex-col gap-6 pb-28 sm:pb-6'>
      <div>
        <h1 className='text-xl sm:text-2xl font-semibold text-gray-900'>{editing ? 'Edit product' : 'Add product'}</h1>
        <p className='text-sm text-gray-500 mt-1'>Add a front and back photo on a plain white background. The background is removed automatically so the garment hangs cleanly on the rack.</p>
      </div>

      <section className='grid grid-cols-2 gap-3 sm:gap-6'>
        <ImageSlot label='Front' hint='shown on the rack' value={front} onChange={setFront} required />
        <ImageSlot label='Back' hint='shown when turned' value={back} onChange={setBack} />
      </section>

      <section className='flex flex-col gap-3'>
        <div>
          <p className='text-sm font-semibold text-gray-800'>Side photos <span className='font-normal text-gray-400'>(optional)</span></p>
          <p className='text-xs text-gray-500 mt-0.5'>
            Shown when the garment is seen from the side on the rack. Skip them and the side is generated automatically
            from the front and back. Add just one and it is mirrored for the other side.
          </p>
        </div>
        <div className='grid grid-cols-2 gap-3 sm:gap-6 sm:max-w-md'>
          <ImageSlot label='Left side' hint='front facing right' value={left} onChange={setLeft} />
          <ImageSlot label='Right side' hint='front facing left' value={right} onChange={setRight} />
        </div>
      </section>

      <section className='flex flex-col gap-4'>
        <Field label='Product name'>
          <input value={name} onChange={e => setName(e.target.value)} required placeholder='e.g. Oversized Cotton Tee – Black'
            className='w-full px-3 py-2.5 text-base sm:text-sm' />
        </Field>

        <div className='grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-4'>
          <Field label='Price (₹)'>
            <input value={price} onChange={e => setPrice(e.target.value)} required type='number' min='0' inputMode='numeric' placeholder='799'
              className='w-full px-3 py-2.5 text-base sm:text-sm' />
          </Field>
          <Field label='Category' note={selectedCategory && `Hangs on the ${HANGERS[hanger].rack} rack · ${HANGERS[hanger].label}`}>
            <select value={category} onChange={e => setCategory(e.target.value)} required className='w-full px-3 py-2.5 text-base sm:text-sm bg-white'>
              <option value=''>Choose a category</option>
              {categories.map(c => (
                <option key={c._id} value={c._id}>{HANGERS[hangerOf(c)].icon} {c.name}</option>
              ))}
            </select>
            {!categories.length && <Link to='/category' className='text-xs text-blue-600 underline mt-1 inline-block'>Create a category first</Link>}
          </Field>
        </div>

        <Field label='Sizes' note='Optional. Customers pick one of these before adding to cart.'>
          <div className='flex flex-wrap gap-2'>
            {sizeOptions.map(s => (
              <button key={s} type='button' onClick={() => toggleSize(s)}
                className={`min-w-[48px] px-3 py-2 rounded-lg text-sm border transition-colors ${sizes.includes(s) ? 'bg-black text-white border-black' : 'bg-white text-gray-700 border-gray-300 hover:border-gray-500'}`}>
                {s}
              </button>
            ))}
          </div>
        </Field>

        <Field label='Description'>
          <textarea value={description} onChange={e => setDescription(e.target.value)} rows={5}
            placeholder='Fabric, fit, wash care…' className='w-full px-3 py-2.5 text-base sm:text-sm resize-y' />
        </Field>

        <label className='flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none'>
          <input type='checkbox' checked={bestseller} onChange={e => setBestseller(e.target.checked)} className='w-4 h-4 accent-black' />
          Mark as bestseller
        </label>
      </section>

      {/* sticky on phones so the button is always in reach */}
      <div className='fixed sm:static bottom-0 inset-x-0 z-30 bg-white/95 sm:bg-transparent backdrop-blur border-t sm:border-0 px-4 py-3 sm:p-0 flex gap-3'>
        {editing && (
          <button type='button' onClick={() => navigate('/list')} className='flex-1 sm:flex-none sm:w-32 py-3 rounded-xl border border-gray-300 text-sm'>Cancel</button>
        )}
        <button type='submit' disabled={saving}
          className='flex-[2] sm:flex-none sm:w-48 py-3 rounded-xl bg-black text-white text-sm font-semibold disabled:opacity-50'>
          {saving ? 'Saving…' : editing ? 'Save changes' : 'Add product'}
        </button>
      </div>

      {saving && (
        <div className='fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-6'>
          <div className='bg-white p-6 rounded-2xl flex flex-col items-center gap-3 text-center'>
            <div className='w-10 h-10 border-4 border-gray-200 border-t-black rounded-full animate-spin' />
            <p className='font-semibold'>Uploading photos…</p>
          </div>
        </div>
      )}
    </form>
  )
}

const Field = ({ label, note, children }) => (
  <div className='flex flex-col gap-1.5 min-w-0'>
    <p className='text-sm font-semibold text-gray-800'>{label}</p>
    {children}
    {note && <p className='text-xs text-gray-500'>{note}</p>}
  </div>
)

export default ProductForm
