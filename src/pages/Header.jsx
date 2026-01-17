import React, { useState, useEffect } from 'react'
import { assets } from '../assets/assets'
import axios from 'axios'
import { backendUrl } from '../App'
import { toast } from 'react-toastify'

const Header = ({ token }) => {
  const [logo, setLogo] = useState(false)
  const [currentHeader, setCurrentHeader] = useState(null)
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(false)

  useEffect(() => {
    fetchHeader()
  }, [])

  const fetchHeader = async () => {
    setFetchLoading(true)
    try {
      const response = await axios.get(backendUrl + '/api/header/get')
      if (response.data.success && response.data.data) {
        setCurrentHeader(response.data.data)
      }
    } catch (error) {
      console.log(error)
    } finally {
      setFetchLoading(false)
    }
  }

  const onSubmitHandler = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const formData = new FormData()
      formData.append('logo', logo)

      if (currentHeader) {
        formData.append('id', currentHeader._id)
        const response = await axios.put(backendUrl + '/api/header/edit', formData, { headers: { token } })
        if (response.data.success) {
          toast.success('Logo updated successfully')
          fetchHeader()
        } else {
          toast.error(response.data.message)
        }
      } else {
        const response = await axios.post(backendUrl + '/api/header/add', formData, { headers: { token } })
        if (response.data.success) {
          toast.success('Logo added successfully')
          fetchHeader()
        } else {
          toast.error(response.data.message)
        }
      }
      setLogo(false)
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='flex flex-col gap-6'>
      <h2 className='text-2xl font-semibold'>Header Logo Management</h2>

      {currentHeader && (
        <div className='border p-4 rounded bg-gray-50'>
          <p className='mb-2 font-medium'>Current Logo:</p>
          <img src={currentHeader.logo} alt="Current Logo" className='w-32 h-32 object-contain border' />
        </div>
      )}

      <form onSubmit={onSubmitHandler} className='flex flex-col gap-4'>
        <div>
          <p className='mb-2'>{currentHeader ? 'Upload New Logo' : 'Upload Logo'}</p>
          <label htmlFor="logo">
            <img className='w-32 cursor-pointer' src={!logo ? assets.upload_area : URL.createObjectURL(logo)} alt="" />
            <input onChange={(e) => setLogo(e.target.files[0])} type="file" id="logo" hidden required />
          </label>
        </div>

        <button type="submit" className='w-40 py-3 bg-black text-white' disabled={loading}>
          {loading ? 'Saving...' : currentHeader ? 'UPDATE LOGO' : 'ADD LOGO'}
        </button>
      </form>

      {/* Loading Overlay */}
      {(fetchLoading || loading) && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white p-6 rounded-lg flex flex-col items-center gap-3'>
            <div className='w-12 h-12 border-4 border-gray-300 border-t-black rounded-full animate-spin'></div>
            <p className='text-lg font-semibold'>{fetchLoading ? 'Loading Header...' : 'Saving Logo...'}</p>
            {loading && <p className='text-sm text-gray-600'>Please wait while uploading logo</p>}
          </div>
        </div>
      )}
    </div>
  )
}

export default Header
