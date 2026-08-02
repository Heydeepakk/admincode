import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { backendUrl } from '../App';
import { toast } from 'react-toastify';

const Attribute = ({ token }) => {
  const [attributes, setAttributes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [filteredSubCategories, setFilteredSubCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubCategory, setSelectedSubCategory] = useState('');
  const [attributeInputs, setAttributeInputs] = useState([{ name: '', variants: [''] }]);
  const [variantValue, setVariantValue] = useState('');
  const [editingAttribute, setEditingAttribute] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [variantLoading, setVariantLoading] = useState(null);

  useEffect(() => {
    fetchAttributes();
    fetchCategories();
    fetchSubCategories();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      const filtered = subCategories.filter(sub => {
        const catId = sub?.categoryId?._id || sub?.categoryId
        return catId && String(catId) === String(selectedCategory)
      })
      setFilteredSubCategories(filtered)
      setSelectedSubCategory('')
    } else {
      setFilteredSubCategories([])
    }
  }, [selectedCategory, subCategories]);

  const fetchAttributes = async () => {
    setFetchLoading(true)
    try {
      const response = await axios.get(backendUrl + '/api/attribute/list');
      if (response.data.success) {
        setAttributes(response.data.attributes);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setFetchLoading(false)
    }
  };

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

  const handleAddAttributeInput = () => {
    setAttributeInputs([...attributeInputs, { name: '', variants: [''] }]);
  };

  const handleRemoveAttributeInput = (index) => {
    setAttributeInputs(attributeInputs.filter((_, i) => i !== index));
  };

  const handleAttributeNameChange = (index, value) => {
    const updated = [...attributeInputs];
    updated[index].name = value;
    setAttributeInputs(updated);
  };

  const handleVariantChange = (attrIndex, variantIndex, value) => {
    const updated = [...attributeInputs];
    updated[attrIndex].variants[variantIndex] = value;
    setAttributeInputs(updated);
  };

  const handleAddVariantInput = (attrIndex) => {
    const updated = [...attributeInputs];
    updated[attrIndex].variants.push('');
    setAttributeInputs(updated);
  };

  const handleRemoveVariantInput = (attrIndex, variantIndex) => {
    const updated = [...attributeInputs];
    updated[attrIndex].variants = updated[attrIndex].variants.filter((_, i) => i !== variantIndex);
    setAttributeInputs(updated);
  };

  const handleCreateAttributes = async (e) => {
    e.preventDefault();
    
    if (!selectedSubCategory) {
      toast.error('Please select a subcategory');
      return;
    }

    setLoading(true);
    try {
      for (const attr of attributeInputs) {
        if (attr.name.trim()) {
          const variants = attr.variants.filter(v => v.trim()).map(v => ({ value: v.trim() }));
          await axios.post(
            backendUrl + '/api/attribute/create',
            { name: attr.name.trim(), subCategoryId: selectedSubCategory, variants },
            { headers: { token } }
          );
        }
      }
      toast.success('Attributes created successfully');
      setAttributeInputs([{ name: '', variants: [''] }]);
      setSelectedCategory('');
      setSelectedSubCategory('');
      fetchAttributes();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddVariant = async (attributeId) => {
    if (!variantValue.trim()) {
      toast.error('Variant value is required');
      return;
    }
    setVariantLoading(attributeId);
    try {
      const response = await axios.post(
        backendUrl + `/api/attribute/add-variant/${attributeId}`,
        { value: variantValue },
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success(response.data.message);
        setVariantValue('');
        setEditingAttribute(null);
        fetchAttributes();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setVariantLoading(null);
    }
  };

  const handleRemoveVariant = async (attributeId, variantId) => {
    setDeleteLoading(variantId)
    try {
      const response = await axios.delete(
        backendUrl + `/api/attribute/remove-variant/${attributeId}/${variantId}`,
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success(response.data.message);
        fetchAttributes();
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setDeleteLoading(null)
    }
  };

  const handleDeleteAttribute = async (id) => {
    setDeleteLoading(id)
    try {
      const response = await axios.delete(backendUrl + `/api/attribute/delete/${id}`, { headers: { token } });
      if (response.data.success) {
        toast.success(response.data.message);
        fetchAttributes();
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setDeleteLoading(null)
    }
  };

  const filteredAttributes = selectedSubCategory
    ? attributes.filter(attr => attr.subCategoryId?._id === selectedSubCategory)
    : attributes;

  return (
    <div className='flex gap-8'>
      {/* Form */}
      <div className='w-1/3'>
        <h2 className='text-xl font-semibold mb-4'>Create Attributes</h2>
        <form onSubmit={handleCreateAttributes} className='flex flex-col gap-3'>
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

          <select
            value={selectedSubCategory}
            onChange={(e) => setSelectedSubCategory(e.target.value)}
            className='px-3 py-2 border'
            required
            disabled={!selectedCategory}
          >
            <option value=''>Select SubCategory</option>
            {filteredSubCategories.map((subCat) => (
              <option key={subCat._id} value={subCat._id}>
                {subCat.name}
              </option>
            ))}
          </select>

          {/* Multiple Attributes */}
          <div className='border-t pt-3 mt-2'>
            {attributeInputs.map((attr, attrIndex) => (
              <div key={attrIndex} className='border p-3 mb-3 bg-gray-50'>
                <div className='flex gap-2 mb-2'>
                  <input
                    type='text'
                    placeholder='Attribute Name (e.g., Color, Size)'
                    value={attr.name}
                    onChange={(e) => handleAttributeNameChange(attrIndex, e.target.value)}
                    className='px-3 py-2 border flex-1'
                    required
                  />
                  {attributeInputs.length > 1 && (
                    <button
                      type='button'
                      onClick={() => handleRemoveAttributeInput(attrIndex)}
                      className='bg-red-500 text-white px-3 py-2 text-sm'
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Variants */}
                <div className='ml-3'>
                  <p className='text-sm font-medium mb-2'>Variants:</p>
                  {attr.variants.map((variant, variantIndex) => (
                    <div key={variantIndex} className='flex gap-2 mb-2'>
                      <input
                        type='text'
                        placeholder='Variant value'
                        value={variant}
                        onChange={(e) => handleVariantChange(attrIndex, variantIndex, e.target.value)}
                        className='px-2 py-1 border flex-1 text-sm'
                      />
                      {attr.variants.length > 1 && (
                        <button
                          type='button'
                          onClick={() => handleRemoveVariantInput(attrIndex, variantIndex)}
                          className='bg-gray-400 text-white px-2 py-1 text-xs'
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type='button'
                    onClick={() => handleAddVariantInput(attrIndex)}
                    className='bg-blue-500 text-white px-3 py-1 text-sm mt-1'
                  >
                    + Add Variant
                  </button>
                </div>
              </div>
            ))}

            <button
              type='button'
              onClick={handleAddAttributeInput}
              className='bg-green-500 text-white px-4 py-2 w-full mb-3'
            >
              + Add Another Attribute
            </button>
          </div>

          <button type='submit' disabled={loading} className='bg-black text-white px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed'>
            {loading ? '⏳ Creating...' : 'Create All Attributes'}
          </button>
        </form>
      </div>

      {/* List */}
      <div className='flex-1'>
        <div className='flex justify-between items-center mb-4'>
          <h2 className='text-xl font-semibold'>Attributes List</h2>
          {selectedSubCategory && (
            <button
              onClick={() => setSelectedSubCategory('')}
              className='text-sm text-blue-500 underline'
            >
              Show All
            </button>
          )}
        </div>
        <div className='grid gap-4'>
          {filteredAttributes.map((attr) => (
            <div key={attr._id} className='border p-4 bg-white'>
              <div className='flex justify-between items-start mb-3'>
                <div>
                  <p className='font-medium text-lg'>{attr.name}</p>
                  <p className='text-sm text-gray-500'>
                    Category: {attr.subCategoryId?.categoryId?.name || 'N/A'} → SubCategory: {attr.subCategoryId?.name || 'N/A'}
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteAttribute(attr._id)}
                  className='bg-red-500 text-white px-3 py-1 text-sm disabled:opacity-50'
                  disabled={deleteLoading === attr._id}
                >
                  {deleteLoading === attr._id ? 'Deleting...' : 'Delete'}
                </button>
              </div>

              {/* Variants */}
              <div className='mt-3'>
                <p className='text-sm font-medium mb-2'>Variants:</p>
                <div className='flex flex-wrap gap-2 mb-3'>
                  {attr.variants?.map((variant) => (
                    <div key={variant._id} className='flex items-center gap-1 bg-gray-100 px-2 py-1 rounded'>
                      <span className='text-sm'>{variant.value}</span>
                      <button
                        onClick={() => handleRemoveVariant(attr._id, variant._id)}
                        className='text-red-500 text-xs ml-1 disabled:opacity-50'
                        disabled={deleteLoading === variant._id}
                      >
                        {deleteLoading === variant._id ? '⏳' : '✕'}
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add Variant */}
                <div className='flex gap-2'>
                  <input
                    type='text'
                    placeholder='Add variant value'
                    value={editingAttribute === attr._id ? variantValue : ''}
                    onChange={(e) => {
                      setVariantValue(e.target.value);
                      setEditingAttribute(attr._id);
                    }}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddVariant(attr._id);
                      }
                    }}
                    className='px-2 py-1 border text-sm flex-1'
                  />
                  <button
                    onClick={() => handleAddVariant(attr._id)}
                    disabled={variantLoading === attr._id}
                    className='bg-blue-500 text-white px-3 py-1 text-sm disabled:opacity-50 disabled:cursor-not-allowed'
                  >
                    {variantLoading === attr._id ? '⏳ Adding...' : 'Add'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Loading Overlay */}
      {(fetchLoading || loading) && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white p-6 rounded-lg flex flex-col items-center gap-3'>
            <div className='w-12 h-12 border-4 border-gray-300 border-t-black rounded-full animate-spin'></div>
            <p className='text-lg font-semibold'>{fetchLoading ? 'Loading Attributes...' : 'Processing...'}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Attribute;
