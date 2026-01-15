import React, { useEffect, useState } from 'react'
import {assets} from '../assets/assets'
import axios from 'axios'
import { backendUrl } from '../App'

const Navbar = ({setToken}) => {
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
    <div className='flex items-center py-2 px-[4%] justify-between'>
        <img className='w-[max(10%,80px)]' src={logo} alt="" />
        <button onClick={()=>setToken('')} className='bg-gray-600 text-white px-5 py-2 sm:px-7 sm:py-2 rounded-full text-xs sm:text-sm'>Logout</button>
    </div>
  )
}

export default Navbar