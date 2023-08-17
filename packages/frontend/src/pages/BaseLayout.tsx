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

    const gradients = [
        'linear-gradient(100deg, #FF892A -15%, #8A5F35 5%, #000000 30%, #305F67 95%, #52ACBC 115%)',
        'linear-gradient(150deg, #FF892A -15%, #8A5F35 5%, #000000 30%, #305F67 95%, #52ACBC 115%)',
        'linear-gradient(200deg, #FF892A -15%, #8A5F35 5%, #000000 30%, #305F67 95%, #52ACBC 115%)',
        'linear-gradient(250deg, #FF892A -15%, #8A5F35 5%, #000000 30%, #305F67 95%, #52ACBC 115%)',
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
