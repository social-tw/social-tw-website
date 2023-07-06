import React, { useContext, useEffect } from 'react'
import Navbar from '../layout/Navbar'
import { Outlet, useNavigate } from 'react-router-dom'
import { User, UserContext } from '../contexts/User'
import Button from '../components/shared/Button'
import { observer } from 'mobx-react-lite'

const Home = observer(() => {
  const userContext = useContext(UserContext)
  const navigate = useNavigate()

  useEffect(() => {
    if (!userContext.hasSignedUp) {
      navigate('/login')
    } else {
      navigate('/')
    }
  }, [userContext.hasSignedUp, navigate])

  return (
    <div data-theme="dark" className='flex h-full flex-col justify-center'>
      <Navbar />
      <div className="h-full">
        <Outlet />
      </div>
    </div>
  )
})

export default Home
