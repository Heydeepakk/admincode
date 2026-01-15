import React, { useState, useEffect } from 'react';
import { assets } from '../assets/assets';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { backendUrl } from '../App';

const Dashboard = ({ token }) => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalCategories: 0,
    recentOrders: []
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      console.log('Fetching stats from APIs...');
      
      // Fetch products count from /api/product/list (GET)
      const productsRes = await axios.get(backendUrl + '/api/product/list');
      console.log('Products response:', productsRes.data);
      
      // Fetch orders count from /api/order/list (POST)
      const ordersRes = await axios.post(backendUrl + '/api/order/list', {}, { 
        headers: { token } 
      });
      console.log('Orders response:', ordersRes.data);
      
      // Fetch categories count from /api/category/list (GET)
      const categoriesRes = await axios.get(backendUrl + '/api/category/list');
      console.log('Categories response:', categoriesRes.data);

      // Count total data items
      const productCount = productsRes.data.success && productsRes.data.products ? productsRes.data.products.length : 0;
      const orderCount = ordersRes.data.success && ordersRes.data.orders ? ordersRes.data.orders.length : 0;
      const categoryCount = categoriesRes.data.success && categoriesRes.data.categories ? categoriesRes.data.categories.length : 0;
      
      console.log('Counts - Products:', productCount, 'Orders:', orderCount, 'Categories:', categoryCount);

      setStats({
        totalProducts: productCount,
        totalOrders: orderCount,
        totalCategories: categoryCount,
        recentOrders: ordersRes.data.success && ordersRes.data.orders ? ordersRes.data.orders.slice(0, 5) : []
      });
    } catch (error) {
      console.log('Error fetching stats:', error);
      console.log('Error details:', error.response?.data);
      // Set default values on error
      setStats({
        totalProducts: 0,
        totalOrders: 0,
        totalCategories: 0,
        recentOrders: []
      });
    }
  };

  return (
    <div className='p-6'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold text-gray-800 mb-2'>Admin Dashboard</h1>
        <p className='text-gray-600'>Welcome to your store management panel</p>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
        <div className='bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-gray-600 text-sm'>Total Products</p>
              <p className='text-3xl font-bold text-gray-800'>{stats.totalProducts}</p>
            </div>
            <div className='bg-blue-100 p-3 rounded-full'>
              <img src={assets.add_icon} alt="" className='w-6 h-6' />
            </div>
          </div>
        </div>

        <div className='bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-gray-600 text-sm'>Total Orders</p>
              <p className='text-3xl font-bold text-gray-800'>{stats.totalOrders}</p>
            </div>
            <div className='bg-green-100 p-3 rounded-full'>
              <img src={assets.order_icon} alt="" className='w-6 h-6' />
            </div>
          </div>
        </div>

        <div className='bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-gray-600 text-sm'>Categories</p>
              <p className='text-3xl font-bold text-gray-800'>{stats.totalCategories}</p>
            </div>
            <div className='bg-purple-100 p-3 rounded-full'>
              <img src={assets.add_icon} alt="" className='w-6 h-6' />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <div className='bg-white p-6 rounded-lg shadow-md'>
          <h3 className='text-xl font-semibold mb-4 text-gray-800'>Quick Actions</h3>
          <div className='space-y-3'>
            <button 
              onClick={() => navigate('/add')}
              className='w-full text-left p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors'
            >
              <div className='flex items-center gap-3'>
                <img src={assets.add_icon} alt="" className='w-5 h-5' />
                <span className='font-medium'>Add New Product</span>
              </div>
            </button>
            <button 
              onClick={() => navigate('/orders')}
              className='w-full text-left p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors'
            >
              <div className='flex items-center gap-3'>
                <img src={assets.order_icon} alt="" className='w-5 h-5' />
                <span className='font-medium'>View Orders</span>
              </div>
            </button>
            <button 
              onClick={() => navigate('/category')}
              className='w-full text-left p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors'
            >
              <div className='flex items-center gap-3'>
                <img src={assets.add_icon} alt="" className='w-5 h-5' />
                <span className='font-medium'>Manage Categories</span>
              </div>
            </button>
          </div>
        </div>

        <div className='bg-white p-6 rounded-lg shadow-md'>
          <h3 className='text-xl font-semibold mb-4 text-gray-800'>Recent Orders</h3>
          <div className='space-y-3'>
            {stats.recentOrders.length > 0 ? (
              stats.recentOrders.map((order, index) => (
                <div key={index} className='flex justify-between items-center p-3 bg-gray-50 rounded-lg'>
                  <div>
                    <p className='font-medium text-sm'>Order #{order._id?.slice(-6)}</p>
                    <p className='text-xs text-gray-600 capitalize'>{order.status}</p>
                  </div>
                  <p className='font-semibold'>₹{order.amount}</p>
                </div>
              ))
            ) : (
              <p className='text-gray-500 text-center py-4'>No recent orders</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;