import { clsx } from 'clsx'
import { motion } from 'framer-motion'
import React from 'react'

interface BackdropProps {
    isOpen: boolean
    background?: string
    children: React.ReactNode
    position: 'absolute' | 'fixed'
}

export default function Backdrop({
    isOpen,
    background,
    children,
    position,
}: BackdropProps) {
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
                ${position} 
                inset-0 
                z-50
                h-full
                `,
                    background && `${background}`,
                )}
                variants={modalVariants}
                initial="hidden"
                animate="visible"
            />
            <motion.div
                className={`
                ${position} 
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
