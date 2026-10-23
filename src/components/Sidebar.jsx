import React from 'react'
import { NavLink } from 'react-router-dom'
import { assets } from '../assets/assets'

const LINKS = [
  { to: '/', label: 'Dashboard', icon: assets.add_icon },
  { to: '/add', label: 'Add Product', icon: assets.add_icon },
  { to: '/list', label: 'Products', icon: assets.order_icon },
  { to: '/orders', label: 'Orders', icon: assets.order_icon },
  { to: '/category', label: 'Categories & Hangers', icon: assets.add_icon },
  { to: '/delivery-charges', label: 'Delivery Charges', icon: assets.add_icon },
  { to: '/header', label: 'Header Logo', icon: assets.add_icon },
  { to: '/banner', label: 'Banner', icon: assets.add_icon },
  { to: '/about', label: 'About Us', icon: assets.add_icon },
]

// Static column on desktop, slide-in drawer on phones.
const Sidebar = ({ open, onClose }) => {
  return (
    <>
      <div onClick={onClose} className={`md:hidden fixed inset-0 z-40 bg-black/30 transition-opacity ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} />
      <nav className={`fixed md:sticky top-0 md:top-[61px] left-0 z-50 md:z-auto h-full md:h-[calc(100vh-61px)] w-64 md:w-56 lg:w-60 flex-shrink-0 bg-white border-r overflow-y-auto transition-transform md:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className='flex items-center justify-between px-4 py-4 md:hidden border-b'>
          <span className='font-semibold text-gray-800'>Menu</span>
          <button onClick={onClose} aria-label='Close menu' className='w-9 h-9 rounded-lg hover:bg-gray-100 text-xl'>✕</button>
        </div>
        <div className='flex flex-col gap-2 p-3 md:pt-6 text-[15px]'>
          {LINKS.map(l => (
            <NavLink key={l.to} to={l.to} end={l.to === '/'} onClick={onClose}
              className='flex items-center gap-3 border border-gray-200 px-3 py-2.5 rounded-lg hover:bg-gray-50'>
              <img className='w-5 h-5' src={l.icon} alt='' />
              <p>{l.label}</p>
            </NavLink>
          ))}
        </div>
      </nav>
    </>
  )
}

export default Sidebar
