import React, { Fragment } from 'react'
import { motion } from 'framer-motion'
import { clsx } from 'clsx'

interface ModalProps {
    isOpen: boolean
    background?: string
    children: React.ReactNode
    postion: 'absolute' | 'fixed'
}

const Modal: React.FC<ModalProps> = ({
    isOpen,
    background,
    children,
    postion,
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
                className={clsx(
                    `
                ${postion} 
                inset-0 
                z-50
                h-full
                `,
                    background && `${background}`
                )}
                variants={modalVariants}
                initial="hidden"
                animate="visible"
            />
            <motion.div
                className={`
                ${postion} 
                inset-0 
                z-50
                h-full
                mt-0
                `}
                variants={chidrenVarients}
                initial="hidden"
                animate="visible"
            >
                {children}
            </motion.div>
        </>
    )
}

export default Modal
