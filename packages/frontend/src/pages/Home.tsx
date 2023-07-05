import React from 'react'
import Navbar from '../components/Navbar'
import { Outlet } from 'react-router-dom'

const Home = () => {
  return (
    <div data-theme="dark" className='flex h-full flex-col justify-center'>
      <Navbar />
      <Outlet />
    </div>
  )
}

export default Home
