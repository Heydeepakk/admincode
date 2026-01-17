import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { backendUrl, currency } from '../App'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'

const List = ({ token }) => {

  const [list, setList] = useState([])
  const [viewProduct, setViewProduct] = useState(null)
  const [loading, setLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(null)
  const navigate = useNavigate()

  const fetchList = async () => {
    setLoading(true)
    try {

      const response = await axios.get(backendUrl + '/api/product/list')
      if (response.data.success) {
        setList(response.data.products.reverse());
      }
      else {
        toast.error(response.data.message)
      }

    } catch (error) {
      console.log(error)
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const removeProduct = async (id) => {
    setDeleteLoading(id)
    try {

      const response = await axios.post(backendUrl + '/api/product/remove', { id }, { headers: { token } })

      if (response.data.success) {
        toast.success(response.data.message)
        await fetchList();
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

  return (
    <>
      <p className='mb-2'>All Products List</p>
      <div className='flex flex-col gap-2'>

        {/* ------- List Table Title ---------- */}

        <div className='hidden md:grid grid-cols-[1fr_3fr_1fr_1fr_1fr_1fr] items-center py-1 px-2 border bg-gray-100 text-sm'>
          <b>Image</b>
          <b>Name</b>
          <b>Category</b>
          <b>SubCategory</b>
          <b>Price</b>
          <b className='text-center'>Actions</b>
        </div>

        {/* ------ Product List ------ */}

        {
          list.map((item, index) => (
            <div className='grid grid-cols-[1fr_3fr_1fr] md:grid-cols-[1fr_3fr_1fr_1fr_1fr_1fr] items-center gap-2 py-1 px-2 border text-sm' key={index}>
              <img className='w-12' src={item.image[0]} alt="" />
              <p>{item.name}</p>
              <p>{item.category?.name || 'N/A'}</p>
              <p>{item.subCategory?.name || 'N/A'}</p>
              <p>{currency}{item.price}</p>
              <div className='flex gap-2 justify-center'>
                <button 
                  onClick={() => setViewProduct(item)} 
                  className='bg-blue-500 text-white px-3 py-1 rounded text-xs'
                >
                  View
                </button>
                <button 
                  onClick={() => navigate('/edit/' + item._id)} 
                  className='bg-green-500 text-white px-3 py-1 rounded text-xs'
                >
                  Edit
                </button>
                <button 
                  onClick={() => removeProduct(item._id)} 
                  className='bg-red-500 text-white px-3 py-1 rounded text-xs disabled:opacity-50'
                  disabled={deleteLoading === item._id}
                >
                  {deleteLoading === item._id ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          ))
        }

      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white p-6 rounded-lg flex flex-col items-center gap-3'>
            <div className='w-12 h-12 border-4 border-gray-300 border-t-black rounded-full animate-spin'></div>
            <p className='text-lg font-semibold'>Loading Products...</p>
          </div>
        </div>
      )}

      {/* View Product Modal */}
      {viewProduct && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50' onClick={() => setViewProduct(null)}>
          <div className='bg-white p-6 rounded-lg max-w-3xl max-h-[90vh] overflow-y-auto' onClick={(e) => e.stopPropagation()}>
            <div className='flex justify-between items-start mb-4'>
              <h2 className='text-2xl font-bold'>{viewProduct.name}</h2>
              <button onClick={() => setViewProduct(null)} className='text-2xl'>&times;</button>
            </div>

            {/* Images */}
            <div className='flex gap-2 mb-4 overflow-x-auto'>
              {viewProduct.image.map((img, i) => (
                <img key={i} src={img} alt="" className='w-32 h-32 object-cover border rounded' />
              ))}
            </div>

            {/* Details */}
            <div className='grid gap-3'>
              <div>
                <p className='font-semibold'>Description:</p>
                <p className='text-gray-700'>{viewProduct.description}</p>
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <p className='font-semibold'>Category:</p>
                  <p>{viewProduct.category?.name || 'N/A'}</p>
                </div>
                <div>
                  <p className='font-semibold'>SubCategory:</p>
                  <p>{viewProduct.subCategory?.name || 'N/A'}</p>
                </div>
              </div>

              <div>
                <p className='font-semibold'>Base Price:</p>
                <p className='text-lg'>{currency}{viewProduct.price}</p>
              </div>

              <div>
                <p className='font-semibold'>Sizes:</p>
                <div className='flex gap-2'>
                  {viewProduct.sizes?.map((size, i) => (
                    <span key={i} className='bg-gray-200 px-3 py-1 rounded'>{size}</span>
                  ))}
                </div>
              </div>

              <div>
                <p className='font-semibold'>Bestseller:</p>
                <p>{viewProduct.bestseller ? 'Yes' : 'No'}</p>
              </div>

              {/* Variants */}
              {viewProduct.variants && viewProduct.variants.length > 0 && (
                <div>
                  <p className='font-semibold mb-3 text-lg'>Product Variants</p>
                  <div className='grid gap-3 max-h-80 overflow-y-auto pr-2'>
                    {viewProduct.variants.map((variant, i) => (
                      <div key={i} className='border-2 border-gray-200 p-4 rounded-lg bg-gradient-to-r from-gray-50 to-white hover:shadow-md transition-shadow'>
                        <div className='flex flex-col gap-3'>
                          {/* Attributes */}
                          <div className='flex flex-wrap gap-2'>
                            {variant.attributes?.map((attr, j) => (
                              <div key={j} className='bg-blue-500 text-white px-3 py-1.5 rounded-full text-sm font-medium shadow-sm'>
                                {attr.attributeName}: <span className='font-bold'>{attr.variantValue}</span>
                              </div>
                            ))}
                          </div>
                          
                          {/* Price, Quantity, SKU */}
                          <div className='flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200'>
                            <div className='flex gap-6'>
                              <div>
                                <p className='text-xs text-gray-500 uppercase tracking-wide'>Price</p>
                                <p className='text-xl font-bold text-green-600'>{currency}{variant.price}</p>
                              </div>
                              <div className='border-l pl-6'>
                                <p className='text-xs text-gray-500 uppercase tracking-wide'>Stock</p>
                                <p className='text-xl font-bold text-blue-600'>{variant.quantity}</p>
                              </div>
                              {variant.sku && (
                                <div className='border-l pl-6'>
                                  <p className='text-xs text-gray-500 uppercase tracking-wide'>SKU</p>
                                  <p className='text-sm font-semibold text-gray-700'>{variant.sku}</p>
                                </div>
                              )}
                            </div>
                            
                            {/* Stock Status Badge */}
                            <div>
                              {variant.quantity > 10 ? (
                                <span className='bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold'>In Stock</span>
                              ) : variant.quantity > 0 ? (
                                <span className='bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-semibold'>Low Stock</span>
                              ) : (
                                <span className='bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-semibold'>Out of Stock</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Summary */}
                  <div className='mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200'>
                    <div className='flex justify-between items-center'>
                      <p className='text-sm font-semibold text-blue-900'>Total Variants: {viewProduct.variants.length}</p>
                      <p className='text-sm font-semibold text-blue-900'>
                        Total Stock: {viewProduct.variants.reduce((sum, v) => sum + (v.quantity || 0), 0)} units
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button 
              onClick={() => setViewProduct(null)} 
              className='mt-4 bg-gray-800 text-white px-6 py-2 rounded w-full'
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  )
}

export default List