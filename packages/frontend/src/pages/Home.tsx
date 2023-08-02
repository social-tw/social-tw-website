import React, { useContext, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Outlet, useNavigate, useSearchParams } from 'react-router-dom'
import { UserContext } from '../contexts/User'
import { observer } from 'mobx-react-lite'

const Home = observer(() => {
    const userContext = useContext(UserContext);
    const [searchParams] = useSearchParams();
    const code = searchParams.get('code');
    const status = searchParams.get('status');
    const navigate = useNavigate();

    const gradients = [
        'linear-gradient(100deg, #FF892A -7.09%, #8A5F35 11.12%, #000000 43.32%, #305F67 85.4%, #52ACBC 102.38%)',
        'linear-gradient(150deg, #FF892A -8.34%, #8A5F35 10.16%, #000000 42.86%, #305F67 85.6%, #52ACBC 102.84%)',
        'linear-gradient(200deg, #FF892A -7.48%, #8A5F35 9.26%, #000000 38.87%, #305F67 77.56%, #52ACBC 93.17%)',
        'linear-gradient(250deg, #FF892A -9.12%, #8A5F35 15.09%, #000000 47.84%, #305F67 90.9%, #52ACBC 110.95%)',
    ];

    const gradientVariants = {
        animate: {
            background: gradients,
            transition: {
                duration: 10,
                ease: 'linear',
            },
        },
    };

    useEffect(() => {
        if (!userContext.hasSignedUp && code) {
            navigate(`/login?code=${code}&status=${status}`)
        } else if (!userContext.hasSignedUp && !code) {
            navigate('/login')
        } else {
            navigate('/')
        }
    }, [userContext.hasSignedUp, navigate, code])

    return (
        <motion.div
            className='flex h-full flex-col justify-center'
            variants={gradientVariants}
            initial='animate'
            animate='animate'
        >
            <Outlet />
        </motion.div>
    )
})

export default Home
