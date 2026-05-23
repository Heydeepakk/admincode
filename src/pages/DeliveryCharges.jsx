import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { backendUrl } from '../App'
import { toast } from 'react-toastify'

const DeliveryCharges = ({ token }) => {
  const [deliveryCharges, setDeliveryCharges] = useState([])
  const [minAmount, setMinAmount] = useState('')
  const [deliveryCharge, setDeliveryCharge] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(null)

  const fetchDeliveryCharges = async () => {
    setFetchLoading(true)
    try {
      const response = await axios.get(backendUrl + '/api/cart/getadmindeliverycharges', { headers: { token } })
      if (response.data.success) {
        setDeliveryCharges(response.data.deliveryCharges)
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setFetchLoading(false)
    }
  }

  useEffect(() => {
    fetchDeliveryCharges()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!minAmount || !deliveryCharge) {
      toast.error('Please fill all fields')
      return
    }

    setLoading(true)
    try {
      let response
      if (editingId) {
        response = await axios.put(
          backendUrl + `/api/cart/updatedeliverycharge/${editingId}`,
          { minAmount: parseFloat(minAmount), deliveryCharge: parseFloat(deliveryCharge) },
          { headers: { token } }
        )
      } else {
        response = await axios.post(
          backendUrl + '/api/cart/adddeliverycharge',
          { minAmount: parseFloat(minAmount), deliveryCharge: parseFloat(deliveryCharge) },
          { headers: { token } }
        )
      }

      if (response.data.success) {
        toast.success(response.data.message)
        setMinAmount('')
        setDeliveryCharge('')
        setEditingId(null)
        fetchDeliveryCharges()
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    setDeleteLoading(id)
    try {
      const response = await axios.delete(
        backendUrl + `/api/cart/deletedeliverycharge/${id}`,
        { headers: { token } }
      )
      if (response.data.success) {
        toast.success(response.data.message)
        fetchDeliveryCharges()
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setDeleteLoading(null)
    }
  }

  const startEdit = (item) => {
    setEditingId(item._id)
    setMinAmount(item.minAmount.toString())
    setDeliveryCharge(item.deliveryCharge.toString())
  }

  const cancelEdit = () => {
    setEditingId(null)
    setMinAmount('')
    setDeliveryCharge('')
  }

  return (
    <div className='flex flex-col gap-6'>
      <h1 className='text-2xl font-bold'>Delivery Charges</h1>

      <div className='flex gap-8'>
        {/* Form */}
        <div className='w-1/3'>
          <h2 className='text-xl font-semibold mb-4'>
            {editingId ? 'Edit Delivery Charge' : 'Add Delivery Charge'}
          </h2>
          <form onSubmit={handleSubmit} className='flex flex-col gap-3'>
            <input
              type='number'
              placeholder='Minimum Amount (₹)'
              value={minAmount}
              onChange={(e) => setMinAmount(e.target.value)}
              className='px-3 py-2 border rounded'
              step='0.01'
              min='0'
              required
            />
            <input
              type='number'
              placeholder='Delivery Charge (₹)'
              value={deliveryCharge}
              onChange={(e) => setDeliveryCharge(e.target.value)}
              className='px-3 py-2 border rounded'
              step='0.01'
              min='0'
              required
            />
            <div className='flex gap-2'>
              <button
                type='submit'
                disabled={loading}
                className='bg-black text-white px-4 py-2 flex-1 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-900'
              >
                {loading ? '⏳ Processing...' : editingId ? 'Update' : 'Add'}
              </button>
              {editingId && (
                <button
                  type='button'
                  onClick={cancelEdit}
                  disabled={loading}
                  className='bg-gray-400 text-white px-4 py-2 rounded disabled:opacity-50 hover:bg-gray-500'
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* List */}
        <div className='flex-1'>
          <h2 className='text-xl font-semibold mb-4'>Delivery Charges List</h2>
          {fetchLoading ? (
            <div className='text-center py-8 text-gray-500'>Loading...</div>
          ) : deliveryCharges.length === 0 ? (
            <div className='text-center py-8 text-gray-500'>
              No delivery charges added yet
            </div>
          ) : (
            <div className='grid gap-2'>
              <div className='grid grid-cols-3 gap-4 mb-2 font-semibold bg-gray-100 p-3 rounded'>
                <p>Min Amount (₹)</p>
                <p>Delivery Charge (₹)</p>
                <p className='text-right'>Actions</p>
              </div>
              {deliveryCharges.map((item) => (
                <div
                  key={item._id}
                  className='grid grid-cols-3 gap-4 border p-3 bg-white rounded hover:bg-gray-50'
                >
                  <p className='font-medium'>₹{item.minAmount.toFixed(2)}</p>
                  <p>₹{item.deliveryCharge.toFixed(2)}</p>
                  <div className='flex gap-2 justify-end'>
                    <button
                      onClick={() => startEdit(item)}
                      className='bg-blue-500 text-white px-3 py-1 text-sm rounded hover:bg-blue-600'
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className='bg-red-500 text-white px-3 py-1 text-sm rounded hover:bg-red-600 disabled:opacity-50'
                      disabled={deleteLoading === item._id}
                    >
                      {deleteLoading === item._id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Loading Overlay */}
      {(fetchLoading || loading) && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white p-6 rounded-lg flex flex-col items-center gap-3'>
            <div className='w-12 h-12 border-4 border-gray-300 border-t-black rounded-full animate-spin'></div>
            <p className='text-lg font-semibold'>
              {fetchLoading ? 'Loading Charges...' : 'Processing...'}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default DeliveryCharges
