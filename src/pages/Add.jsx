import React, { useState, useEffect } from 'react'
import {assets} from '../assets/assets'
import axios from 'axios'
import { backendUrl } from '../App'
import { toast } from 'react-toastify'
import { CKEditor } from '@ckeditor/ckeditor5-react'
import ClassicEditor from '@ckeditor/ckeditor5-build-classic'

const Add = ({token}) => {

  const [image1,setImage1] = useState(false)
  const [image2,setImage2] = useState(false)
  const [image3,setImage3] = useState(false)
  const [image4,setImage4] = useState(false)

   const [name, setName] = useState("");
   const [description, setDescription] = useState("");
   const [price, setPrice] = useState("");
   const [category, setCategory] = useState("");
   const [subCategory, setSubCategory] = useState("");
   const [bestseller, setBestseller] = useState(false);
   const [sizes, setSizes] = useState([]);
   const [categories, setCategories] = useState([]);
   const [subCategories, setSubCategories] = useState([]);
   const [filteredSubCategories, setFilteredSubCategories] = useState([]);
   const [attributes, setAttributes] = useState([]);
   const [variants, setVariants] = useState([]);
   const [loading, setLoading] = useState(false);
   const [seo, setSeo] = useState({ metaTitle: '', metaDescription: '', metaKeywords: '', slug: '', canonicalUrl: '', ogImage: '' });

   useEffect(() => {
     fetchCategories();
     fetchSubCategories();
     fetchAttributes();
   }, []);

   useEffect(() => {
     if (category) {
       const filtered = subCategories.filter(sub => sub.categoryId._id === category);
       setFilteredSubCategories(filtered);
       setSubCategory('');
     }
   }, [category, subCategories]);

   useEffect(() => {
     if (subCategory) {
       generateVariants();
     } else {
       setVariants([]);
     }
   }, [subCategory, attributes]);

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

   const fetchAttributes = async () => {
     try {
       const response = await axios.get(backendUrl + '/api/attribute/list');
       if (response.data.success) {
         setAttributes(response.data.attributes);
       }
     } catch (error) {
       toast.error(error.message);
     }
   };

   const generateVariants = () => {
     const subCategoryAttributes = attributes.filter(attr => attr.subCategoryId?._id === subCategory);
     
     if (subCategoryAttributes.length === 0) {
       setVariants([]);
       return;
     }

     // Generate all combinations
     const combinations = [];
     const generate = (index, current) => {
       if (index === subCategoryAttributes.length) {
         combinations.push([...current]);
         return;
       }
       
       const attr = subCategoryAttributes[index];
       for (const variant of attr.variants) {
         generate(index + 1, [...current, {
           attributeId: attr._id,
           attributeName: attr.name,
           variantValue: variant.value
         }]);
       }
     };
     
     generate(0, []);
     
     const variantsWithPriceQty = combinations.map(combo => ({
       attributes: combo,
       price: price || 0,
       quantity: 0,
       sku: ''
     }));
     
     setVariants(variantsWithPriceQty);
   };

   const updateVariant = (index, field, value) => {
     const updated = [...variants];
     updated[index][field] = field === 'price' || field === 'quantity' ? Number(value) : value;
     setVariants(updated);
   };

   const CLOUDINARY_CLOUD = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
   const CLOUDINARY_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

   const uploadToCloudinary = async (file) => {
     const data = new FormData()
     data.append('file', file)
     data.append('upload_preset', CLOUDINARY_PRESET)
     const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`, { method: 'POST', body: data })
     const json = await res.json()
     if (!json.secure_url) throw new Error('Image upload failed')
     return json.secure_url
   }

   const onSubmitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const imageFiles = [image1, image2, image3, image4].filter(Boolean)
      if (imageFiles.length === 0) { toast.error('Please upload at least one image'); setLoading(false); return }

      const imageUrls = await Promise.all(imageFiles.map(uploadToCloudinary))

      const formData = new FormData()
      formData.append("name", name)
      formData.append("description", description)
      formData.append("price", price)
      formData.append("category", category)
      formData.append("subCategory", subCategory)
      formData.append("bestseller", bestseller)
      formData.append("sizes", JSON.stringify(sizes))
      formData.append("variants", JSON.stringify(variants))
      formData.append("seo", JSON.stringify(seo))
      formData.append("imageUrls", JSON.stringify(imageUrls))

      const response = await axios.post(backendUrl + "/api/product/add", formData, { headers: { token } })

      if (response.data.success) {
        toast.success(response.data.message)
        setName('')
        setDescription('')
        setImage1(false)
        setImage2(false)
        setImage3(false)
        setImage4(false)
        setPrice('')
        setCategory('')
        setSubCategory('')
        setSizes([])
        setVariants([])
        setSeo({ metaTitle: '', metaDescription: '', metaKeywords: '', slug: '', canonicalUrl: '', ogImage: '' })
      } else {
        toast.error(response.data.message)
      }

    } catch (error) {
      console.log(error);
      toast.error(error.message)
    } finally {
      setLoading(false);
    }
   }

  return (
    <form onSubmit={onSubmitHandler} className='flex flex-col w-full items-start gap-3'>
        <div>
          <p className='mb-2'>Upload Image</p>

          <div className='flex gap-2'>
            <label htmlFor="image1">
              <img className='w-20' src={!image1 ? assets.upload_area : URL.createObjectURL(image1)} alt="" />
              <input onChange={(e)=>setImage1(e.target.files[0])} type="file" id="image1" hidden/>
            </label>
            <label htmlFor="image2">
              <img className='w-20' src={!image2 ? assets.upload_area : URL.createObjectURL(image2)} alt="" />
              <input onChange={(e)=>setImage2(e.target.files[0])} type="file" id="image2" hidden/>
            </label>
            <label htmlFor="image3">
              <img className='w-20' src={!image3 ? assets.upload_area : URL.createObjectURL(image3)} alt="" />
              <input onChange={(e)=>setImage3(e.target.files[0])} type="file" id="image3" hidden/>
            </label>
            <label htmlFor="image4">
              <img className='w-20' src={!image4 ? assets.upload_area : URL.createObjectURL(image4)} alt="" />
              <input onChange={(e)=>setImage4(e.target.files[0])} type="file" id="image4" hidden/>
            </label>
          </div>
        </div>

        <div className='w-full'>
          <p className='mb-2'>Product name</p>
          <input onChange={(e)=>setName(e.target.value)} value={name} className='w-full max-w-[500px] px-3 py-2' type="text" placeholder='Type here' required/>
        </div>

        <div className='w-full'>
          <p className='mb-2'>Product description</p>
          <CKEditor
            editor={ClassicEditor}
            data={description}
            onChange={(event, editor) => {
              const data = editor.getData();
              setDescription(data);
            }}
            config={{
              toolbar: [
                'heading', '|',
                'bold', 'italic', 'link', '|',
                'bulletedList', 'numberedList', '|',
                'outdent', 'indent', '|',
                'blockQuote', 'insertTable', '|',
                'undo', 'redo'
              ]
            }}
          />
        </div>

        <div className='flex flex-col sm:flex-row gap-2 w-full sm:gap-8'>

            <div>
              <p className='mb-2'>Product category</p>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className='w-full px-3 py-2' required>
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
              </select>
            </div>

            <div>
              <p className='mb-2'>Sub category</p>
              <select value={subCategory} onChange={(e) => setSubCategory(e.target.value)} className='w-full px-3 py-2' required disabled={!category}>
                  <option value="">Select SubCategory</option>
                  {filteredSubCategories.map(subCat => (
                    <option key={subCat._id} value={subCat._id}>{subCat.name}</option>
                  ))}
              </select>
            </div>

            <div>
              <p className='mb-2'>Base Price</p>
              <input onChange={(e) => setPrice(e.target.value)} value={price} className='w-full px-3 py-2 sm:w-[120px]' type="Number" placeholder='25' required/>
            </div>

        </div>

        {/* <div>
          <p className='mb-2'>Product Sizes</p>
          <div className='flex gap-3'>
            <div onClick={()=>setSizes(prev => prev.includes("S") ? prev.filter( item => item !== "S") : [...prev,"S"])}>
              <p className={`${sizes.includes("S") ? "bg-pink-100" : "bg-slate-200" } px-3 py-1 cursor-pointer`}>S</p>
            </div>
            
            <div onClick={()=>setSizes(prev => prev.includes("M") ? prev.filter( item => item !== "M") : [...prev,"M"])}>
              <p className={`${sizes.includes("M") ? "bg-pink-100" : "bg-slate-200" } px-3 py-1 cursor-pointer`}>M</p>
            </div>

            <div onClick={()=>setSizes(prev => prev.includes("L") ? prev.filter( item => item !== "L") : [...prev,"L"])}>
              <p className={`${sizes.includes("L") ? "bg-pink-100" : "bg-slate-200" } px-3 py-1 cursor-pointer`}>L</p>
            </div>

            <div onClick={()=>setSizes(prev => prev.includes("XL") ? prev.filter( item => item !== "XL") : [...prev,"XL"])}>
              <p className={`${sizes.includes("XL") ? "bg-pink-100" : "bg-slate-200" } px-3 py-1 cursor-pointer`}>XL</p>
            </div>

            <div onClick={()=>setSizes(prev => prev.includes("XXL") ? prev.filter( item => item !== "XXL") : [...prev,"XXL"])}>
              <p className={`${sizes.includes("XXL") ? "bg-pink-100" : "bg-slate-200" } px-3 py-1 cursor-pointer`}>XXL</p>
            </div>
          </div>
        </div> */}

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
                        {variant.attributes.map((attr, i) => (
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
                          value={variant.sku}
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
          <input onChange={() => setBestseller(prev => !prev)} checked={bestseller} type="checkbox" id='bestseller' />
          <label className='cursor-pointer' htmlFor="bestseller">Add to bestseller</label>
        </div>

        {/* SEO Section */}
        <div className='w-full mt-6 border rounded p-4 bg-gray-50'>
          <p className='text-lg font-semibold mb-1'>SEO Settings</p>
          <p className='text-xs text-gray-500 mb-4'>These fields help your product appear in Google search results.</p>
          <div className='flex flex-col gap-3'>
            <div>
              <label className='text-sm font-medium block mb-1'>Meta Title <span className='text-gray-400 font-normal'>(blue link in Google — max 60 chars)</span></label>
              <input value={seo.metaTitle} onChange={e => setSeo(p => ({...p, metaTitle: e.target.value}))} maxLength={60}
                className='w-full max-w-[600px] px-3 py-2 border text-sm' placeholder='e.g. Buy Gold Ring Online | Krivante' />
              <p className='text-xs text-gray-400 mt-0.5'>{seo.metaTitle.length}/60</p>
            </div>
            <div>
              <label className='text-sm font-medium block mb-1'>Meta Description <span className='text-gray-400 font-normal'>(snippet below title in Google — max 160 chars)</span></label>
              <textarea value={seo.metaDescription} onChange={e => setSeo(p => ({...p, metaDescription: e.target.value}))} maxLength={160} rows={3}
                className='w-full max-w-[600px] px-3 py-2 border text-sm resize-none' placeholder='e.g. Shop this beautiful gold ring at Krivante. Fast delivery, easy returns.' />
              <p className='text-xs text-gray-400 mt-0.5'>{seo.metaDescription.length}/160</p>
            </div>
            <div>
              <label className='text-sm font-medium block mb-1'>Meta Keywords <span className='text-gray-400 font-normal'>(comma separated)</span></label>
              <input value={seo.metaKeywords} onChange={e => setSeo(p => ({...p, metaKeywords: e.target.value}))}
                className='w-full max-w-[600px] px-3 py-2 border text-sm' placeholder='gold ring, buy ring online, krivante ring' />
            </div>
            <div>
              <label className='text-sm font-medium block mb-1'>URL Slug <span className='text-gray-400 font-normal'>(e.g. gold-ring-18k — used in canonical URL)</span></label>
              <input value={seo.slug} onChange={e => setSeo(p => ({...p, slug: e.target.value.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'')}))} 
                className='w-full max-w-[600px] px-3 py-2 border text-sm' placeholder='gold-ring-18k' />
            </div>
            <div>
              <label className='text-sm font-medium block mb-1'>OG Image URL <span className='text-gray-400 font-normal'>(image shown on WhatsApp/Facebook share)</span></label>
              <input value={seo.ogImage} onChange={e => setSeo(p => ({...p, ogImage: e.target.value}))}
                className='w-full max-w-[600px] px-3 py-2 border text-sm' placeholder='https://...' />
            </div>
          </div>
        </div>

        <button type="submit" className='w-28 py-3 mt-4 bg-black text-white' disabled={loading}>
          {loading ? 'Adding...' : 'ADD'}
        </button>

        {/* Loader Overlay */}
        {loading && (
          <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
            <div className='bg-white p-6 rounded-lg flex flex-col items-center gap-3'>
              <div className='w-12 h-12 border-4 border-gray-300 border-t-black rounded-full animate-spin'></div>
              <p className='text-lg font-semibold'>Adding Product...</p>
              <p className='text-sm text-gray-600'>Please wait while uploading images</p>
            </div>
          </div>
        )}

    </form>
  )
}

export default Add