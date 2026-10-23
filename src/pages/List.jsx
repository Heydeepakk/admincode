import axios from 'axios'
import React, { useEffect, useMemo, useState } from 'react'
import { backendUrl, currency } from '../App'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import { HANGERS, hangerOf } from '../utils/hangers'

const List = ({ token }) => {

  const [list, setList] = useState([])
  const [loading, setLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(null)
  const [query, setQuery] = useState('')
  const [rack, setRack] = useState('all')
  const navigate = useNavigate()

  const fetchList = async () => {
    setLoading(true)
    try {
      const response = await axios.get(backendUrl + '/api/product/list')
      if (response.data.success) setList(response.data.products.reverse())
      else toast.error(response.data.message)
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const removeProduct = async (item) => {
    if (!window.confirm(`Delete "${item.name}"?`)) return
    setDeleteLoading(item._id)
    try {
      const response = await axios.post(backendUrl + '/api/product/remove', { id: item._id }, { headers: { token } })
      if (response.data.success) {
        toast.success(response.data.message)
        await fetchList()
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    } finally {
      setDeleteLoading(null)
    }
  }

  useEffect(() => {
    fetchList()
  }, [])

  const shown = useMemo(() => list.filter(item =>
    (rack === 'all' || hangerOf(item.category) === rack) &&
    item.name.toLowerCase().includes(query.trim().toLowerCase())
  ), [list, rack, query])

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3'>
        <div>
          <h1 className='text-xl sm:text-2xl font-semibold text-gray-900'>Products</h1>
          <p className='text-sm text-gray-500'>{list.length} products</p>
        </div>
        <button onClick={() => navigate('/add')} className='self-start sm:self-auto bg-black text-white text-sm font-semibold px-5 py-2.5 rounded-xl'>+ Add product</button>
      </div>

      <div className='flex flex-col sm:flex-row gap-3'>
        <input value={query} onChange={e => setQuery(e.target.value)} placeholder='Search products…'
          className='flex-1 px-3 py-2.5 text-base sm:text-sm' />
        <div className='flex gap-2 overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0'>
          {['all', ...Object.keys(HANGERS)].map(key => (
            <button key={key} onClick={() => setRack(key)}
              className={`flex-shrink-0 px-3 py-2 rounded-full text-xs border ${rack === key ? 'bg-black text-white border-black' : 'bg-white border-gray-300 text-gray-600'}`}>
              {key === 'all' ? 'All' : `${HANGERS[key].icon} ${HANGERS[key].rack}`}
            </button>
          ))}
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-3'>
        {shown.map(item => {
          const hanger = hangerOf(item.category)
          return (
            <div key={item._id} className='flex gap-3 bg-white border rounded-2xl p-3'>
              <div className='flex gap-1.5 flex-shrink-0'>
                {[0, 1].map(i => (
                  <div key={i} className='relative w-16 sm:w-20 aspect-[4/5] rounded-lg overflow-hidden checkerboard border'>
                    {item.image?.[i]
                      ? <img src={item.image[i]} alt='' className='w-full h-full object-contain' />
                      : <span className='absolute inset-0 flex items-center justify-center text-[10px] text-gray-400 text-center px-1'>no back</span>}
                    <span className='absolute bottom-0 inset-x-0 bg-black/55 text-white text-[9px] text-center py-0.5'>{i ? 'Back' : 'Front'}</span>
                  </div>
                ))}
              </div>

              <div className='flex-1 min-w-0 flex flex-col'>
                <p className='font-medium text-gray-900 text-sm leading-snug line-clamp-2'>{item.name}</p>
                <p className='text-xs text-gray-500 mt-0.5'>{item.category?.name || 'No category'} · {HANGERS[hanger].icon} {HANGERS[hanger].rack}</p>
                <p className='text-sm font-semibold text-gray-900 mt-1'>{currency}{item.price}</p>
                {item.sizes?.length > 0 && <p className='text-[11px] text-gray-500 mt-0.5 truncate'>Sizes: {item.sizes.join(', ')}</p>}
                <div className='flex gap-2 mt-auto pt-2'>
                  <button onClick={() => navigate('/edit/' + item._id)} className='flex-1 sm:flex-none sm:px-4 py-2 rounded-lg border border-gray-300 text-xs font-medium hover:border-gray-500'>Edit</button>
                  <button onClick={() => removeProduct(item)} disabled={deleteLoading === item._id}
                    className='flex-1 sm:flex-none sm:px-4 py-2 rounded-lg border border-red-200 text-red-600 text-xs font-medium hover:bg-red-50 disabled:opacity-50'>
                    {deleteLoading === item._id ? 'Deleting…' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {!loading && shown.length === 0 && <p className='text-sm text-gray-500 text-center py-10'>No products here yet.</p>}

      {loading && (
        <div className='fixed inset-0 bg-black/40 flex items-center justify-center z-50'>
          <div className='bg-white p-6 rounded-2xl flex flex-col items-center gap-3'>
            <div className='w-10 h-10 border-4 border-gray-200 border-t-black rounded-full animate-spin'></div>
            <p className='font-semibold'>Loading products…</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default List
