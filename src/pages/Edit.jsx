import React, { useState, useEffect } from 'react';
import { assets } from '../assets/assets';
import axios from 'axios';
import { backendUrl } from '../App';
import { toast } from 'react-toastify';
import { useParams, useNavigate } from 'react-router-dom';

const Edit = ({ token }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [image1, setImage1] = useState(false);
  const [image2, setImage2] = useState(false);
  const [image3, setImage3] = useState(false);
  const [image4, setImage4] = useState(false);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [subCategory, setSubCategory] = useState('');
  const [bestseller, setBestseller] = useState(false);
  const [sizes, setSizes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [filteredSubCategories, setFilteredSubCategories] = useState([]);
  const [variants, setVariants] = useState([]);
  const [existingImages, setExistingImages] = useState([]);

  useEffect(() => {
    fetchProduct();
    fetchCategories();
    fetchSubCategories();
  }, []);

  useEffect(() => {
    if (category) {
      const filtered = subCategories.filter((sub) => sub.categoryId._id === category);
      setFilteredSubCategories(filtered);
    }
  }, [category, subCategories]);

  const fetchProduct = async () => {
    try {
      const response = await axios.post(backendUrl + '/api/product/single', { productId: id });
      if (response.data.success) {
        const product = response.data.product;
        setName(product.name);
        setDescription(product.description);
        setPrice(product.price);
        setCategory(product.category._id);
        setSubCategory(product.subCategory._id);
        setBestseller(product.bestseller);
        setSizes(product.sizes);
        setVariants(product.variants || []);
        setExistingImages(product.image);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(backendUrl + '/api/category/list');
      if (response.data.success) {
        setCategories(response.data.categories);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const fetchSubCategories = async () => {
    try {
      const response = await axios.get(backendUrl + '/api/subcategory/list');
      if (response.data.success) {
        setSubCategories(response.data.subCategories);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const updateVariant = (index, field, value) => {
    const updated = [...variants];
    updated[index][field] = field === 'price' || field === 'quantity' ? Number(value) : value;
    setVariants(updated);
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();

      formData.append('id', id);
      formData.append('name', name);
      formData.append('description', description);
      formData.append('price', price);
      formData.append('category', category);
      formData.append('subCategory', subCategory);
      formData.append('bestseller', bestseller);
      formData.append('sizes', JSON.stringify(sizes));
      formData.append('variants', JSON.stringify(variants));

      image1 && formData.append('image1', image1);
      image2 && formData.append('image2', image2);
      image3 && formData.append('image3', image3);
      image4 && formData.append('image4', image4);

      const response = await axios.post(backendUrl + '/api/product/update', formData, {
        headers: { token },
      });

      if (response.data.success) {
        toast.success(response.data.message);
        navigate('/list');
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  return (
    <form onSubmit={onSubmitHandler} className='flex flex-col w-full items-start gap-3'>
      <div className='flex gap-4 items-center mb-4'>
        <button
          type='button'
          onClick={() => navigate('/list')}
          className='bg-gray-500 text-white px-4 py-2 rounded'
        >
          ← Back to List
        </button>
        <h2 className='text-2xl font-semibold'>Edit Product</h2>
      </div>

      <div>
        <p className='mb-2'>Product Images</p>
        <div className='flex gap-2 mb-2'>
          {existingImages.map((img, i) => (
            <img key={i} src={img} alt='' className='w-20 h-20 object-cover border' />
          ))}
        </div>
        <p className='text-sm text-gray-600 mb-2'>Upload new images to replace existing ones:</p>
        <div className='flex gap-2'>
          <label htmlFor='image1'>
            <img
              className='w-20'
              src={!image1 ? assets.upload_area : URL.createObjectURL(image1)}
              alt=''
            />
            <input onChange={(e) => setImage1(e.target.files[0])} type='file' id='image1' hidden />
          </label>
          <label htmlFor='image2'>
            <img
              className='w-20'
              src={!image2 ? assets.upload_area : URL.createObjectURL(image2)}
              alt=''
            />
            <input onChange={(e) => setImage2(e.target.files[0])} type='file' id='image2' hidden />
          </label>
          <label htmlFor='image3'>
            <img
              className='w-20'
              src={!image3 ? assets.upload_area : URL.createObjectURL(image3)}
              alt=''
            />
            <input onChange={(e) => setImage3(e.target.files[0])} type='file' id='image3' hidden />
          </label>
          <label htmlFor='image4'>
            <img
              className='w-20'
              src={!image4 ? assets.upload_area : URL.createObjectURL(image4)}
              alt=''
            />
            <input onChange={(e) => setImage4(e.target.files[0])} type='file' id='image4' hidden />
          </label>
        </div>
      </div>

      <div className='w-full'>
        <p className='mb-2'>Product name</p>
        <input
          onChange={(e) => setName(e.target.value)}
          value={name}
          className='w-full max-w-[500px] px-3 py-2 border'
          type='text'
          placeholder='Type here'
          required
        />
      </div>

      <div className='w-full'>
        <p className='mb-2'>Product description</p>
        <textarea
          onChange={(e) => setDescription(e.target.value)}
          value={description}
          className='w-full max-w-[500px] px-3 py-2 border'
          placeholder='Write content here'
          required
        />
      </div>

      <div className='flex flex-col sm:flex-row gap-2 w-full sm:gap-8'>
        <div>
          <p className='mb-2'>Product category</p>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className='w-full px-3 py-2 border'
            required
          >
            <option value=''>Select Category</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <p className='mb-2'>Sub category</p>
          <select
            value={subCategory}
            onChange={(e) => setSubCategory(e.target.value)}
            className='w-full px-3 py-2 border'
            required
            disabled={!category}
          >
            <option value=''>Select SubCategory</option>
            {filteredSubCategories.map((subCat) => (
              <option key={subCat._id} value={subCat._id}>
                {subCat.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <p className='mb-2'>Base Price</p>
          <input
            onChange={(e) => setPrice(e.target.value)}
            value={price}
            className='w-full px-3 py-2 sm:w-[120px] border'
            type='Number'
            placeholder='25'
            required
          />
        </div>
      </div>

      {/* Variants Section */}
      {variants.length > 0 && (
        <div className='w-full mt-4'>
          <p className='mb-3 text-lg font-semibold'>Product Variants (Price & Quantity)</p>
          <div className='border rounded p-4 bg-gray-50 max-h-96 overflow-y-auto'>
            <div className='grid gap-3'>
              {variants.map((variant, index) => (
                <div key={index} className='flex items-center gap-3 bg-white p-3 rounded border'>
                  <div className='flex-1'>
                    <div className='flex gap-2 flex-wrap'>
                      {variant.attributes?.map((attr, i) => (
                        <span key={i} className='text-sm bg-blue-100 px-2 py-1 rounded'>
                          {attr.attributeName}: <strong>{attr.variantValue}</strong>
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className='flex gap-2'>
                    <div>
                      <label className='text-xs text-gray-600'>Price</label>
                      <input
                        type='number'
                        value={variant.price}
                        onChange={(e) => updateVariant(index, 'price', e.target.value)}
                        className='w-24 px-2 py-1 border rounded text-sm'
                        placeholder='Price'
                        required
                      />
                    </div>
                    <div>
                      <label className='text-xs text-gray-600'>Quantity</label>
                      <input
                        type='number'
                        value={variant.quantity}
                        onChange={(e) => updateVariant(index, 'quantity', e.target.value)}
                        className='w-24 px-2 py-1 border rounded text-sm'
                        placeholder='Qty'
                        required
                      />
                    </div>
                    <div>
                      <label className='text-xs text-gray-600'>SKU</label>
                      <input
                        type='text'
                        value={variant.sku || ''}
                        onChange={(e) => updateVariant(index, 'sku', e.target.value)}
                        className='w-28 px-2 py-1 border rounded text-sm'
                        placeholder='SKU'
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className='flex gap-2 mt-2'>
        <input
          onChange={() => setBestseller((prev) => !prev)}
          checked={bestseller}
          type='checkbox'
          id='bestseller'
        />
        <label className='cursor-pointer' htmlFor='bestseller'>
          Add to bestseller
        </label>
      </div>

      <button type='submit' className='w-32 py-3 mt-4 bg-black text-white'>
        UPDATE
      </button>
    </form>
  );
};

export default Edit;
