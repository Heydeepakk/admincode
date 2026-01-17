import React, { useState, useEffect } from 'react'
import { assets } from '../assets/assets'
import axios from 'axios'
import { backendUrl } from '../App'
import { toast } from 'react-toastify'

const Banner = ({ token }) => {
  const [images, setImages] = useState([])
  const [headerText1, setHeaderText1] = useState('')
  const [headerText2, setHeaderText2] = useState('')
  const [headerText3, setHeaderText3] = useState('')
  const [currentBanner, setCurrentBanner] = useState(null)
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(false)

  useEffect(() => {
    fetchBanner()
  }, [])

  const fetchBanner = async () => {
    setFetchLoading(true)
    try {
      const response = await axios.get(backendUrl + '/api/banner/get')
      if (response.data.success && response.data.data) {
        const banner = response.data.data
        setCurrentBanner(banner)
        setHeaderText1(banner.headerText1)
        setHeaderText2(banner.headerText2)
        setHeaderText3(banner.headerText3)
      }
    } catch (error) {
      console.log(error)
    } finally {
      setFetchLoading(false)
    }
  }

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files)
    setImages(files)
  }

  const onSubmitHandler = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const formData = new FormData()
      images.forEach(img => formData.append('images', img))
      formData.append('headerText1', headerText1)
      formData.append('headerText2', headerText2)
      formData.append('headerText3', headerText3)

      if (currentBanner) {
        formData.append('id', currentBanner._id)
        const response = await axios.put(backendUrl + '/api/banner/edit', formData, { headers: { token } })
        if (response.data.success) {
          toast.success('Banner updated successfully')
          fetchBanner()
        } else {
          toast.error(response.data.message)
        }
      } else {
        const response = await axios.post(backendUrl + '/api/banner/add', formData, { headers: { token } })
        if (response.data.success) {
          toast.success('Banner added successfully')
          fetchBanner()
        } else {
          toast.error(response.data.message)
        }
      }
      setImages([])
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='flex flex-col gap-6'>
      <h2 className='text-2xl font-semibold'>Banner Management</h2>

      {currentBanner && (
        <div className='border p-4 rounded bg-gray-50'>
          <p className='mb-3 font-medium'>Current Banner:</p>
          <div className='flex gap-3 flex-wrap mb-4'>
            {currentBanner.images.map((img, idx) => (
              <img key={idx} src={img} alt={`Banner ${idx + 1}`} className='w-40 h-40 object-cover border rounded' />
            ))}
          </div>
          <div className='space-y-2'>
            <p><strong>Header Text 1:</strong> {currentBanner.headerText1}</p>
            <p><strong>Header Text 2:</strong> {currentBanner.headerText2}</p>
            <p><strong>Header Text 3:</strong> {currentBanner.headerText3}</p>
          </div>
        </div>
      )}

      <form onSubmit={onSubmitHandler} className='flex flex-col gap-4'>
        <div>
          <p className='mb-2'>{currentBanner ? 'Upload New Images (optional)' : 'Upload Images'}</p>
          <input 
            type="file" 
            multiple 
            onChange={handleImageChange} 
            className='border px-3 py-2'
            accept='image/*'
            required={!currentBanner}
          />
          {images.length > 0 && (
            <div className='flex gap-2 mt-2 flex-wrap'>
              {images.map((img, idx) => (
                <img key={idx} src={URL.createObjectURL(img)} alt={`Preview ${idx}`} className='w-20 h-20 object-cover border' />
              ))}
            </div>
          )}
        </div>

        <div className='w-full'>
          <p className='mb-2'>Header Text 1</p>
          <input 
            onChange={(e) => setHeaderText1(e.target.value)} 
            value={headerText1} 
            className='w-full max-w-[500px] px-3 py-2 border' 
            type="text" 
            placeholder='Enter header text 1' 
          />
        </div>

        <div className='w-full'>
          <p className='mb-2'>Header Text 2</p>
          <input 
            onChange={(e) => setHeaderText2(e.target.value)} 
            value={headerText2} 
            className='w-full max-w-[500px] px-3 py-2 border' 
            type="text" 
            placeholder='Enter header text 2' 
          />
        </div>

        <div className='w-full'>
          <p className='mb-2'>Header Text 3</p>
          <input 
            onChange={(e) => setHeaderText3(e.target.value)} 
            value={headerText3} 
            className='w-full max-w-[500px] px-3 py-2 border' 
            type="text" 
            placeholder='Enter header text 3' 
          />
        </div>

        <button type="submit" className='w-40 py-3 bg-black text-white' disabled={loading}>
          {loading ? 'Saving...' : currentBanner ? 'UPDATE BANNER' : 'ADD BANNER'}
        </button>
      </form>

      {/* Loading Overlay */}
      {(fetchLoading || loading) && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white p-6 rounded-lg flex flex-col items-center gap-3'>
            <div className='w-12 h-12 border-4 border-gray-300 border-t-black rounded-full animate-spin'></div>
            <p className='text-lg font-semibold'>{fetchLoading ? 'Loading Banner...' : 'Saving Banner...'}</p>
            {loading && <p className='text-sm text-gray-600'>Please wait while uploading images</p>}
          </div>
        </div>
      )}
    </div>
  )
}

export default Banner
