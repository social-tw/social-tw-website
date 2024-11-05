import { Outlet } from 'react-router-dom'
import { motion } from 'framer-motion'

const gradients = [
    'linear-gradient(100deg, #FF892A -15%, #8A5F35 5%, #000000 30%, #305F67 95%, #52ACBC 115%)',
    'linear-gradient(150deg, #FF892A -15%, #8A5F35 5%, #000000 30%, #305F67 95%, #52ACBC 115%)',
    'linear-gradient(200deg, #FF892A -15%, #8A5F35 5%, #000000 30%, #305F67 95%, #52ACBC 115%)',
    'linear-gradient(250deg, #FF892A -15%, #8A5F35 5%, #000000 30%, #305F67 95%, #52ACBC 115%)',
]

export default function StartLayout() {
    return (
        <>
            <motion.div
                className='fixed w-screen h-screen -z-50'
                animate={{
                    background: gradients,
                }}
                transition={{
                    duration: 5,
                }}
            />
            <Outlet />
        </>
    )
}
