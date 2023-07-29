import React, { useContext, useEffect } from 'react'
import Navbar from '../layouts/Navbar'
import { Outlet, useNavigate, useSearchParams } from 'react-router-dom'
import { UserContext } from '../contexts/User'
import { observer } from 'mobx-react-lite'

const Home = observer(() => {
  const userContext = useContext(UserContext)
  const [searchParams] = useSearchParams()
  const code = searchParams.get('code')
  const navigate = useNavigate()

  useEffect(() => {
    if (!userContext.hasSignedUp && code) {
      navigate(`/login?code=${code}`)
    } else if (!userContext.hasSignedUp && !code) {
      navigate('/login')
    } else {
      navigate('/')
    }
  }, [userContext.hasSignedUp, navigate, code])

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
