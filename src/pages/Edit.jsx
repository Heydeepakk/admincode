import React from 'react'
import { useParams } from 'react-router-dom'
import ProductForm from '../components/ProductForm'

const Edit = ({ token }) => {
  const { id } = useParams()
  return <ProductForm key={id} token={token} productId={id} />
}

export default Edit
