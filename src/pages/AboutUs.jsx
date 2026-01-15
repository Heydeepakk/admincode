import React, { useState, useEffect } from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { backendUrl } from '../App';
import { toast } from 'react-toastify';
import axios from 'axios';
import { assets } from '../assets/assets';

const AboutUs = ({ token }) => {
  const [image, setImage] = useState(null);
  const [content, setContent] = useState('');
  const [aboutData, setAboutData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAboutData();
  }, []);

  const fetchAboutData = async () => {
    try {
      const response = await axios.get(backendUrl + '/api/about/get');
      if (response.data.success && response.data.data) {
        setAboutData(response.data.data);
        setContent(response.data.data.content);
        setIsEditing(true);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    
    if (!content) {
      toast.error('Content is required');
      return;
    }

    if (!isEditing && !image) {
      toast.error('Image is required');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('content', content);
      
      if (image) {
        formData.append('image', image);
      }

      let response;
      if (isEditing && aboutData) {
        formData.append('id', aboutData._id);
        response = await axios.post(backendUrl + '/api/about/edit', formData, {
          headers: { token }
        });
      } else {
        response = await axios.post(backendUrl + '/api/about/add', formData, {
          headers: { token }
        });
      }

      if (response.data.success) {
        toast.success(response.data.message);
        fetchAboutData();
        setImage(null);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={onSubmitHandler} className='flex flex-col w-full items-start gap-3'>
        <div>
          <p className='mb-2'>Upload About Us Image</p>
          <label htmlFor="image">
            <img 
              className='w-20 cursor-pointer' 
              src={!image ? (aboutData?.image || assets.upload_area) : URL.createObjectURL(image)} 
              alt="Upload" 
            />
            <input 
              onChange={(e) => setImage(e.target.files[0])} 
              type="file" 
              id="image" 
              accept="image/*"
              hidden 
            />
          </label>
        </div>

        <div className='w-full'>
          <p className='mb-2'>About Us Content</p>
          <CKEditor
            editor={ClassicEditor}
            data={content}
            onChange={(event, editor) => {
              const data = editor.getData();
              setContent(data);
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

        <button type="submit" className='w-28 py-3 mt-4 bg-black text-white' disabled={loading}>
          {loading ? (isEditing ? 'Updating...' : 'Adding...') : (isEditing ? 'UPDATE' : 'ADD')}
        </button>
      </form>

      {/* Loader Overlay */}
      {loading && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white p-6 rounded-lg flex flex-col items-center gap-3'>
            <div className='w-12 h-12 border-4 border-gray-300 border-t-black rounded-full animate-spin'></div>
            <p className='text-lg font-semibold'>{isEditing ? 'Updating About Us...' : 'Adding About Us...'}</p>
            <p className='text-sm text-gray-600'>Please wait while uploading content</p>
          </div>
        </div>
      )}
    </>
  );
};

export default AboutUs;