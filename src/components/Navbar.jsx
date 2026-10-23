import React, { useEffect, useState } from 'react'
import {assets} from '../assets/assets'
import axios from 'axios'
import { backendUrl } from '../App'

const Navbar = ({ setToken, onMenu }) => {
  const [logo, setLogo] = useState(assets.logo)

  useEffect(() => {
    fetchLogo()
  }, [])

  const fetchLogo = async () => {
    try {
      const response = await axios.get(backendUrl + '/api/header/get')
      if (response.data.success && response.data.data) {
        setLogo(response.data.data.logo)
      }
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div className='sticky top-0 z-40 bg-white border-b flex items-center gap-3 py-2 px-4 sm:px-[4%] justify-between'>
        <div className='flex items-center gap-3'>
          <button onClick={onMenu} aria-label='Open menu' className='md:hidden w-10 h-10 -ml-2 flex items-center justify-center rounded-lg hover:bg-gray-100'>
            <svg viewBox='0 0 24 24' className='w-6 h-6' fill='none' stroke='currentColor' strokeWidth='2'><path d='M4 7h16M4 12h16M4 17h16' /></svg>
          </button>
          <img className='h-10 sm:h-12 w-auto object-contain' src={logo} alt="" />
        </div>
        <button onClick={()=>setToken('')} className='bg-gray-600 text-white px-5 py-2 sm:px-7 sm:py-2 rounded-full text-xs sm:text-sm'>Logout</button>
    </div>
  )
}

export default Navbar
