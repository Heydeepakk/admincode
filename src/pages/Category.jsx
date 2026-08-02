import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { backendUrl } from '../App'
import { toast } from 'react-toastify'
import { assets } from '../assets/assets'

const Category = ({ token }) => {
  const [activeTab, setActiveTab] = useState('category')
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [categoryName, setCategoryName] = useState('');
  const [categoryDesc, setCategoryDesc] = useState('');
  const [categoryImage, setCategoryImage] = useState(null);
  const [subCategoryName, setSubCategoryName] = useState('');
  const [subCategoryDesc, setSubCategoryDesc] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingSubCategory, setEditingSubCategory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(null);

  const fetchCategories = async () => {
    setFetchLoading(true)
    try {
      const response = await axios.get(backendUrl + '/api/category/list');
      if (response.data.success) {
        setCategories(response.data.categories);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setFetchLoading(false)
    }
  };

  const fetchSubCategories = async () => {
    setFetchLoading(true)
    try {
      const response = await axios.get(backendUrl + '/api/subcategory/list');
      if (response.data.success) {
        setSubCategories(response.data.subCategories);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setFetchLoading(false)
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchSubCategories();
  }, []);

  const handleAddCategory = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', categoryName);
      formData.append('description', categoryDesc);
      if (categoryImage) {
        formData.append('image', categoryImage);
      }
      
      const response = await axios.post(
        backendUrl + '/api/category/create',
        formData,
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success(response.data.message);
        setCategoryName('');
        setCategoryDesc('');
        setCategoryImage(null);
        fetchCategories();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', categoryName);
      formData.append('description', categoryDesc);
      if (categoryImage) {
        formData.append('image', categoryImage);
      }
      
      const response = await axios.put(
        backendUrl + `/api/category/update/${editingCategory._id}`,
        formData,
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success(response.data.message);
        setCategoryName('');
        setCategoryDesc('');
        setCategoryImage(null);
        setEditingCategory(null);
        fetchCategories();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubCategory = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(
        backendUrl + '/api/subcategory/create',
        { name: subCategoryName, categoryId: selectedCategory, description: subCategoryDesc },
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success(response.data.message);
        setSubCategoryName('');
        setSubCategoryDesc('');
        setSelectedCategory('');
        fetchSubCategories();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSubCategory = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.put(
        backendUrl + `/api/subcategory/update/${editingSubCategory._id}`,
        { name: subCategoryName, categoryId: selectedCategory, description: subCategoryDesc },
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success(response.data.message);
        setSubCategoryName('');
        setSubCategoryDesc('');
        setSelectedCategory('');
        setEditingSubCategory(null);
        fetchSubCategories();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (id) => {
    setDeleteLoading(id)
    try {
      const response = await axios.delete(backendUrl + `/api/category/delete/${id}`, { headers: { token } });
      if (response.data.success) {
        toast.success(response.data.message);
        fetchCategories();
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setDeleteLoading(null)
    }
  };

  const handleDeleteSubCategory = async (id) => {
    setDeleteLoading(id)
    try {
      const response = await axios.delete(backendUrl + `/api/subcategory/delete/${id}`, { headers: { token } });
      if (response.data.success) {
        toast.success(response.data.message);
        fetchSubCategories();
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setDeleteLoading(null)
    }
  };

  const startEditCategory = (cat) => {
    setEditingCategory(cat);
    setCategoryName(cat.name);
    setCategoryDesc(cat.description || '');
    setCategoryImage(null);
  };

  const startEditSubCategory = (subCat) => {
    setEditingSubCategory(subCat);
    setSubCategoryName(subCat.name);
    setSubCategoryDesc(subCat.description || '');
    setSelectedCategory(subCat?.categoryId?._id || subCat?.categoryId || '');
  };

  const cancelEdit = () => {
    setEditingCategory(null);
    setEditingSubCategory(null);
    setCategoryName('');
    setCategoryDesc('');
    setCategoryImage(null);
    setSubCategoryName('');
    setSubCategoryDesc('');
    setSelectedCategory('');
  };

  return (
    <div className='flex flex-col gap-6'>
      {/* Tabs */}
      <div className='flex gap-4 border-b'>
        <button
          onClick={() => setActiveTab('category')}
          className={`px-6 py-3 font-medium ${activeTab === 'category' ? 'border-b-2 border-black text-black' : 'text-gray-500'}`}
        >
          Categories
        </button>
        <button
          onClick={() => setActiveTab('subcategory')}
          className={`px-6 py-3 font-medium ${activeTab === 'subcategory' ? 'border-b-2 border-black text-black' : 'text-gray-500'}`}
        >
          SubCategories
        </button>
      </div>

      {/* Category Tab */}
      {activeTab === 'category' && (
        <div className='flex gap-8'>
          {/* Form */}
          <div className='w-1/3'>
            <h2 className='text-xl font-semibold mb-4'>{editingCategory ? 'Edit Category' : 'Add Category'}</h2>
            <form onSubmit={editingCategory ? handleUpdateCategory : handleAddCategory} className='flex flex-col gap-3'>
              <input
                type='text'
                placeholder='Category Name'
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                className='px-3 py-2 border'
                required
              />
              <input
                type='text'
                placeholder='Description (optional)'
                value={categoryDesc}
                onChange={(e) => setCategoryDesc(e.target.value)}
                className='px-3 py-2 border'
              />
              <div className='flex flex-col gap-2'>
                <label className='text-sm font-medium'>Category Image</label>
                <label htmlFor='categoryImage' className='cursor-pointer'>
                  <img 
                    src={categoryImage ? URL.createObjectURL(categoryImage) : assets.upload_area} 
                    alt='Upload' 
                    className='w-20 h-20 object-cover border-2 border-dashed border-gray-300'
                  />
                </label>
                <input 
                  type='file' 
                  id='categoryImage' 
                  hidden 
                  accept='image/*'
                  onChange={(e) => setCategoryImage(e.target.files[0])}
                />
              </div>
              <div className='flex gap-2'>
                <button type='submit' disabled={loading} className='bg-black text-white px-4 py-2 flex-1 disabled:opacity-50 disabled:cursor-not-allowed'>
                  {loading ? '⏳ Processing...' : editingCategory ? 'Update' : 'Add'}
                </button>
                {editingCategory && (
                  <button type='button' onClick={cancelEdit} disabled={loading} className='bg-gray-400 text-white px-4 py-2 disabled:opacity-50'>
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* List */}
          <div className='flex-1'>
            <h2 className='text-xl font-semibold mb-4'>Category List</h2>
            <div className='grid gap-2'>
              {categories.map((cat) => (
                <div key={cat._id} className='flex justify-between items-center border p-3 bg-white'>
                  <div className='flex items-center gap-3'>
                    {cat.image && (
                      <img src={cat.image} alt={cat.name} className='w-12 h-12 object-cover rounded' />
                    )}
                    <div>
                      <p className='font-medium'>{cat.name}</p>
                      <p className='text-sm text-gray-500'>{cat.description}</p>
                    </div>
                  </div>
                  <div className='flex gap-2'>
                    <button
                      onClick={() => startEditCategory(cat)}
                      className='bg-blue-500 text-white px-3 py-1 text-sm'
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(cat._id)}
                      className='bg-red-500 text-white px-3 py-1 text-sm disabled:opacity-50'
                      disabled={deleteLoading === cat._id}
                    >
                      {deleteLoading === cat._id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SubCategory Tab */}
      {activeTab === 'subcategory' && (
        <div className='flex gap-8'>
          {/* Form */}
          <div className='w-1/3'>
            <h2 className='text-xl font-semibold mb-4'>{editingSubCategory ? 'Edit SubCategory' : 'Add SubCategory'}</h2>
            <form onSubmit={editingSubCategory ? handleUpdateSubCategory : handleAddSubCategory} className='flex flex-col gap-3'>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className='px-3 py-2 border'
                required
              >
                <option value=''>Select Category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <input
                type='text'
                placeholder='SubCategory Name'
                value={subCategoryName}
                onChange={(e) => setSubCategoryName(e.target.value)}
                className='px-3 py-2 border'
                required
              />
              <input
                type='text'
                placeholder='Description (optional)'
                value={subCategoryDesc}
                onChange={(e) => setSubCategoryDesc(e.target.value)}
                className='px-3 py-2 border'
              />
              <div className='flex gap-2'>
                <button type='submit' disabled={loading} className='bg-black text-white px-4 py-2 flex-1 disabled:opacity-50 disabled:cursor-not-allowed'>
                  {loading ? '⏳ Processing...' : editingSubCategory ? 'Update' : 'Add'}
                </button>
                {editingSubCategory && (
                  <button type='button' onClick={cancelEdit} disabled={loading} className='bg-gray-400 text-white px-4 py-2 disabled:opacity-50'>
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* List */}
          <div className='flex-1'>
            <h2 className='text-xl font-semibold mb-4'>SubCategory List</h2>
            <div className='grid gap-2'>
              {subCategories.map((subCat) => (
                <div key={subCat._id} className='flex justify-between items-center border p-3 bg-white'>
                  <div>
                    <p className='font-medium'>{subCat.name}</p>
                    <p className='text-sm text-gray-500'>
                      Category: {subCat.categoryId?.name || 'N/A'} | {subCat.description}
                    </p>
                  </div>
                  <div className='flex gap-2'>
                    <button
                      onClick={() => startEditSubCategory(subCat)}
                      className='bg-blue-500 text-white px-3 py-1 text-sm'
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteSubCategory(subCat._id)}
                      className='bg-red-500 text-white px-3 py-1 text-sm disabled:opacity-50'
                      disabled={deleteLoading === subCat._id}
                    >
                      {deleteLoading === subCat._id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {(fetchLoading || loading) && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white p-6 rounded-lg flex flex-col items-center gap-3'>
            <div className='w-12 h-12 border-4 border-gray-300 border-t-black rounded-full animate-spin'></div>
            <p className='text-lg font-semibold'>{fetchLoading ? 'Loading Categories...' : 'Processing...'}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Category;
