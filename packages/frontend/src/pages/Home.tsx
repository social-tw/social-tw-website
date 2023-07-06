import React from 'react'
import Navbar from '../layout/Navbar'
import { Outlet } from 'react-router-dom'

const Home = () => {
  return (
    <div data-theme="dark" className='flex h-full flex-col justify-center'>
      <Navbar />
      <div className="h-full">
        <Outlet />
      </div>
    </div>
  )
}

export default Home
