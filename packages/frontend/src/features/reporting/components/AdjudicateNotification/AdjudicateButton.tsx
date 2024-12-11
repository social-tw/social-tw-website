import { ReactComponent as ArrowRight } from '@/assets/svg/arrow-right.svg'
import { ReactComponent as GavelRaisedIcon } from '@/assets/svg/gavel-raised.svg'
import { ReactComponent as CloseIcon } from '@/assets/svg/close-button.svg'
import { motion, useReducedMotion } from 'framer-motion'
import { useMediaQuery } from '@uidotdev/usehooks'

export default function AdjudicationButton({
    onCancel = () => {},
    onClick = () => {},
    onClose = () => {},
}: {
    onCancel?: () => void
    onClick?: () => void
    onClose?: () => void
}) {
    const shouldReduceMotion = useReducedMotion()
    const isMobile = useMediaQuery('only screen and (max-width : 768px)')

    const variants = {
        initial: {
            x: isMobile ? -100 : 100,
            opacity: 0,
        },
        animate: {
            x: 0,
            opacity: 1,
        },
        exit: {
            x: isMobile ? -100 : 100,
            opacity: 0,
        },
    }

    return (
        <motion.div
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{
                duration: shouldReduceMotion ? 0 : 0.5,
                ease: 'easeOut',
            }}
            className="relative inline-block"
        >
            {/* Main Button */}
            <button
                className="relative py-2 pl-12 pr-2 bg-black border border-white rounded-lg lg:py-3 lg:pr-4 lg:pl-14 drop-shadow"
                onClick={onClick}
            >
                <GavelRaisedIcon className="absolute bottom-0 -left-3 w-[4.5rem] lg:w-[5.25rem] h-auto" />
                <div className="inline-flex flex-col items-start">
                    <span className="text-base font-bold leading-tight tracking-normal text-white lg:tracking-wider lg:text-lg">
                        新檢舉案出現
                    </span>
                    <span className="text-xs font-medium leading-tight text-white lg:text-sm">
                        <ArrowRight className="inline-block w-3 lg:w-auto mr-0.5 lg:mr-1" />
                        立即前往評判！
                    </span>
                </div>
            </button>

            {/* Close Button */}
            <button
                className="absolute -top-3.5 -right-3.5 w-7 h-7 flex items-center justify-center
                        bg-white rounded-full border border-gray-300 shadow-md hover:bg-gray-100"
                onClick={onClose}
            >
                <CloseIcon className="w-4 h-4 text-black" />
            </button>
        </motion.div>
    )
}
