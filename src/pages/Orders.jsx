import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { backendUrl, currency } from '../App'
import { toast } from 'react-toastify'
import { assets } from '../assets/assets'

const STATUS_COLORS = {
  'Order Placed': 'bg-blue-100 text-blue-700',
  'Packing':      'bg-yellow-100 text-yellow-700',
  'Shipped':      'bg-indigo-100 text-indigo-700',
  'Out for delivery': 'bg-orange-100 text-orange-700',
  'Delivered':    'bg-green-100 text-green-700',
}

const ORDER_STATUSES = ['All', 'Order Placed', 'Packing', 'Shipped', 'Out for delivery', 'Delivered']

const Orders = ({ token }) => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [statusLoading, setStatusLoading] = useState(null)
  const [paymentFilter, setPaymentFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [search, setSearch] = useState('')

  const fetchAllOrders = async () => {
    if (!token) return
    setLoading(true)
    try {
      const response = await axios.post(backendUrl + '/api/order/list', {}, { headers: { token } })
      if (response.data.success) {
        setOrders(response.data.orders.reverse())
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const statusHandler = async (event, orderId) => {
    setStatusLoading(orderId)
    try {
      const response = await axios.post(backendUrl + '/api/order/status', { orderId, status: event.target.value }, { headers: { token } })
      if (response.data.success) await fetchAllOrders()
    } catch (error) {
      toast.error(error.message)
    } finally {
      setStatusLoading(null)
    }
  }

  useEffect(() => { fetchAllOrders() }, [token])

  const filtered = orders.filter(o => {
    if (paymentFilter === 'Paid' && !o.payment) return false
    if (paymentFilter === 'Pending' && o.payment) return false
    if (statusFilter !== 'All' && o.status !== statusFilter) return false
    if (search) {
      const q = search.toLowerCase()
      const name = (o.address.firstName + ' ' + o.address.lastName).toLowerCase()
      if (!name.includes(q) && !o._id.toLowerCase().includes(q)) return false
    }
    return true
  })

  const counts = {
    total: orders.length,
    paid: orders.filter(o => o.payment).length,
    pending: orders.filter(o => !o.payment).length,
    delivered: orders.filter(o => o.status === 'Delivered').length,
  }

  return (
    <div className='p-4 max-w-7xl mx-auto'>
      {/* Header */}
      <div className='flex items-center justify-between mb-4'>
        <h2 className='text-2xl font-bold text-gray-800'>Orders</h2>
        <button onClick={fetchAllOrders} className='text-sm px-3 py-1.5 bg-gray-800 text-white rounded hover:bg-gray-700'>
          ↻ Refresh
        </button>
      </div>

      {/* Stats */}
      <div className='grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5'>
        {[
          { label: 'Total Orders', value: counts.total, color: 'bg-gray-50 border-gray-200' },
          { label: 'Paid', value: counts.paid, color: 'bg-green-50 border-green-200 text-green-700' },
          { label: 'Pending Payment', value: counts.pending, color: 'bg-red-50 border-red-200 text-red-600' },
          { label: 'Delivered', value: counts.delivered, color: 'bg-blue-50 border-blue-200 text-blue-700' },
        ].map(s => (
          <div key={s.label} className={`border rounded-lg p-3 ${s.color}`}>
            <p className='text-xs text-gray-500'>{s.label}</p>
            <p className='text-2xl font-bold'>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className='flex flex-wrap gap-3 mb-4 items-center'>
        {/* Search */}
        <input
          type='text'
          placeholder='Search by name or order ID...'
          value={search}
          onChange={e => setSearch(e.target.value)}
          className='border rounded px-3 py-1.5 text-sm flex-1 min-w-[180px] focus:outline-none focus:ring-1 focus:ring-gray-400'
        />

        {/* Payment Filter */}
        <div className='flex rounded overflow-hidden border text-sm'>
          {['All', 'Paid', 'Pending'].map(f => (
            <button
              key={f}
              onClick={() => setPaymentFilter(f)}
              className={`px-3 py-1.5 ${paymentFilter === f ? 'bg-gray-800 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className='border rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400'
        >
          {ORDER_STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      {/* Orders Count */}
      <p className='text-sm text-gray-500 mb-3'>Showing {filtered.length} order{filtered.length !== 1 ? 's' : ''}</p>

      {/* Order List */}
      {filtered.length === 0 && !loading ? (
        <div className='text-center py-16 text-gray-400'>No orders found.</div>
      ) : (
        <div className='flex flex-col gap-3'>
          {filtered.map((order) => (
            <div key={order._id} className='bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow'>
              <div className='grid grid-cols-1 sm:grid-cols-[auto_1fr] lg:grid-cols-[auto_1fr_auto_auto_auto] gap-4 items-start'>

                {/* Icon */}
                <img className='w-10 h-10 object-contain' src={assets.parcel_icon} alt='' />

                {/* Customer + Items */}
                <div>
                  <p className='font-semibold text-gray-800'>{order.address.firstName} {order.address.lastName}</p>
                  <p className='text-xs text-gray-400 mb-1'>{order.address.phone}</p>
                  <p className='text-xs text-gray-500'>{order.address.street}, {order.address.city}, {order.address.state}, {order.address.country} — {order.address.zipcode}</p>
                  <div className='mt-2 flex flex-wrap gap-1'>
                    {order.items.map((item, i) => (
                      <span key={i} className='bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full'>
                        {item.name} × {item.quantity} {item.size && `(${item.size})`}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Date + Method */}
                <div className='text-sm text-gray-600 min-w-[120px]'>
                  <p className='text-xs text-gray-400'>{new Date(order.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                  <p className='mt-1 text-xs font-medium uppercase tracking-wide text-gray-500'>{order.paymentMethod}</p>
                  <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full font-medium ${order.payment ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                    {order.payment ? '✓ Paid' : '⏳ Pending'}
                  </span>
                </div>

                {/* Amount */}
                <div className='text-right min-w-[80px]'>
                  <p className='text-lg font-bold text-gray-800'>{currency}{order.amount}</p>
                  <p className='text-xs text-gray-400'>{order.items.length} item{order.items.length !== 1 ? 's' : ''}</p>
                </div>

                {/* Status Dropdown */}
                <div className='min-w-[160px]'>
                  <select
                    onChange={(e) => statusHandler(e, order._id)}
                    value={order.status}
                    disabled={statusLoading === order._id}
                    className={`w-full text-sm font-semibold px-2 py-1.5 rounded-lg border focus:outline-none ${STATUS_COLORS[order.status] || 'bg-gray-100'}`}
                  >
                    {ORDER_STATUSES.filter(s => s !== 'All').map(s => <option key={s}>{s}</option>)}
                  </select>
                  {statusLoading === order._id && <p className='text-xs text-blue-500 mt-1 text-center'>Updating...</p>}
                </div>

              </div>
            </div>
          ))}
        </div>
      )}

      {/* Loading Overlay */}
      {loading && (
        <div className='fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50'>
          <div className='bg-white p-6 rounded-xl flex flex-col items-center gap-3 shadow-xl'>
            <div className='w-10 h-10 border-4 border-gray-200 border-t-gray-800 rounded-full animate-spin'></div>
            <p className='font-semibold text-gray-700'>Loading Orders...</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default Orders
