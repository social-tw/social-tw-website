import { motion } from 'framer-motion'
import { observer } from 'mobx-react-lite'
import { useContext, useState } from 'react'
import { Outlet, useNavigate, useSearchParams } from 'react-router-dom'
import { UserContext } from '../contexts/User'
import useAutoNavigation from '../hooks/useAutoNavigation'
import useInitUser from '../hooks/useInitUser'

const BaseLayout = observer(() => {
    const [searchParams] = useSearchParams()
    const hashUserId = searchParams.get('code')
    const status = searchParams.get('status')
    const navigate = useNavigate()
    const userContext = useContext(UserContext)
    const [isLoading, setIsLoading] = useState(true)

    //TODO: Using status to check if user has signed up or not
    // It always call twitter auth api no matter signup or login

    const gradients = [
        'linear-gradient(100deg, #FF892A -7.09%, #8A5F35 11.12%, #000000 43.32%, #305F67 85.4%, #52ACBC 102.38%)',
        'linear-gradient(150deg, #FF892A -8.34%, #8A5F35 10.16%, #000000 42.86%, #305F67 85.6%, #52ACBC 102.84%)',
        'linear-gradient(200deg, #FF892A -7.48%, #8A5F35 9.26%, #000000 38.87%, #305F67 77.56%, #52ACBC 93.17%)',
        'linear-gradient(250deg, #FF892A -9.12%, #8A5F35 15.09%, #000000 47.84%, #305F67 90.9%, #52ACBC 110.95%)',
    ]

    const gradientVariants = {
        animate: {
            background: gradients,
            transition: {
                duration: 10,
                ease: 'linear',
            },
        },
    }

    useInitUser(userContext, hashUserId, setIsLoading)
    useAutoNavigation(hashUserId, status, navigate, userContext, isLoading)

    return (
        <motion.div
            className='h-full overflow-y-scroll'
            variants={gradientVariants}
            initial='animate'
            animate='animate'
        >
            <Outlet />
            {/* <Forwording /> */}
        </motion.div>
    )
})

export default BaseLayout
