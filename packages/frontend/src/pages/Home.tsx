import React from 'react'
import Navbar from '../layout/Navbar'
import { Outlet } from 'react-router-dom'
import { User, UserContext } from '../contexts/User'
import Button from '../components/shared/Button'

const Home = () => {
  // TODO: loading sate
  // TODO: context can't pass
 
  return (
    <div data-theme="dark" className='flex h-full flex-col justify-center'>
      <Navbar />
      {/* <Button color={`bg-btn-login`} text={`test`}/> */}
      <div className="h-full">
        <Outlet />
      </div>
    </div>
  )
}

export default Home
