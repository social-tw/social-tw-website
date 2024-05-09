import { motion } from 'framer-motion'
import { Outlet } from 'react-router-dom'

export default function BaseLayout() {
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

    return (
        <motion.div
            className="h-full overflow-hidden"
            variants={gradientVariants}
            initial="animate"
            animate="animate"
        >
            <Outlet />
        </motion.div>
    )
}


