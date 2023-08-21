import React, { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { IoClose } from 'react-icons/io5'
import { motion } from 'framer-motion'
import { clsx } from 'clsx'

interface ModalProps {
    isOpen: boolean
    onClose?: () => void
    children: React.ReactNode
}

const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    children
}) => {
    const modalVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                duration: 0.4,
                ease: 'easeInOut',
            },
        },
    }

    const chidrenVarients = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                delay: 0.2,
                duration: 0.4,
                ease: 'easeInOut',
            },
        },
    }

    if (!isOpen) return null

    return (
        <>
            <motion.div
                className='
                fixed 
                inset-0 
                z-50
                bg-black
                bg-opacity-90
                h-full
                '      
                variants={modalVariants}
                initial='hidden'
                animate='visible'
            />
            <motion.div
                className='
                fixed 
                inset-0
                z-[60]
                bg-opacity-80
                '
                variants={chidrenVarients}
                initial='hidden'
                animate='visible'
            >
                {children}
            </motion.div>
        </>
    )
}

export default Modal
