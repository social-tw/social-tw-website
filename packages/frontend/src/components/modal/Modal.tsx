import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { IoClose } from 'react-icons/io5';
import { motion } from 'framer-motion';

interface ModalProps {
    isOpen?: boolean;
    onClose?: () => void;
    children: React.ReactNode;
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
    };

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

    return (
        <motion.div
            className='
            fixed 
            inset-0 
            z-50
            bg-black
            bg-opacity-90
            '
            variants={modalVariants}
            initial='hidden'
            animate='visible'
        >
            <motion.div
                className='
                flex
                h-full 

                items-center
                justify-center
                '
                variants={chidrenVarients}
                initial='hidden'
                animate='visible'
            >
                {children}
            </motion.div>
        </motion.div>
    )
}

export default Modal;
