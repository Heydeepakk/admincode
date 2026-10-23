import React, { useEffect, useState } from 'react'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import { Routes, Route } from 'react-router-dom'
import Add from './pages/Add'
import List from './pages/List'
import Orders from './pages/Orders'
import Category from './pages/Category'
import Edit from './pages/Edit'
import Header from './pages/Header'
import Banner from './pages/Banner'
import AboutUs from './pages/AboutUs'
import DeliveryCharges from './pages/DeliveryCharges'
import Dashboard from './pages/Dashboard'
import Login from './components/Login'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const backendUrl = import.meta.env.VITE_BACKEND_URL
export const currency = '₹'

const App = () => {

  const [token, setToken] = useState(localStorage.getItem('token')?localStorage.getItem('token'):'');
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(()=>{
    localStorage.setItem('token',token)
  },[token])

  return (
    <div className='bg-gray-50 min-h-screen'>
      <ToastContainer />
      {token === ""
        ? <Login setToken={setToken} />
        : <>
          <Navbar setToken={setToken} onMenu={() => setMenuOpen(true)} />
          <div className='flex w-full'>
            <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
            <div className='flex-1 min-w-0 px-4 sm:px-8 py-6 sm:py-8 text-gray-600 text-base'>
              <Routes>
                <Route path='/' element={<Dashboard token={token} />} />
                <Route path='/add' element={<Add token={token} />} />
                <Route path='/list' element={<List token={token} />} />
                <Route path='/edit/:id' element={<Edit token={token} />} />
                <Route path='/orders' element={<Orders token={token} />} />
                <Route path='/category' element={<Category token={token} />} />
                <Route path='/header' element={<Header token={token} />} />
                <Route path='/banner' element={<Banner token={token} />} />
                <Route path='/about' element={<AboutUs token={token} />} />
                <Route path='/delivery-charges' element={<DeliveryCharges token={token} />} />
              </Routes>
            </div>
          </div>
        </>
      }
    </div>
  )
}

export default App