import { motion } from 'framer-motion'
import React, { useEffect, useRef } from 'react'

interface ScrollingModalProps {
    children: React.ReactNode
    method: string
    variants: any
}

const WelcomeBackgroundList: React.FC<ScrollingModalProps> = ({
    children,
    method,
    variants,
}) => {
    const postListRef = useRef<HTMLDivElement>(null)
    const handleScroll = () => {
        const container = postListRef.current
        if (!container) return
        const ulElement = container.querySelector('ul')
        if (!ulElement) return

        const children = Array.from(ulElement.children) as HTMLElement[]
        const containerHeight = container.clientHeight
        const scrollPosition = container.scrollTop

        children.forEach((child) => {
            const childTop = child.offsetTop - scrollPosition
            const childBottom = childTop + child.clientHeight
            const middle = containerHeight / 2

            const centerZoneHeight = 50
            const centerTop = middle - centerZoneHeight / 2
            const centerBottom = middle + centerZoneHeight / 2

            if (childTop < centerBottom && childBottom > centerTop) {
                child.style.opacity = '1'
            } else if (childBottom < middle) { 
                child.style.opacity = '0.1' 
            } else { 
                child.style.opacity = '0.3' 
            }
        })
    }

    useEffect(() => {
        const container = postListRef.current
        if (container) {
            container.addEventListener('scroll', handleScroll)
            setTimeout(() => {
                handleScroll()
            }, 300)
        }

        return () => {
            if (container) {
                container.removeEventListener('scroll', handleScroll)
            }
        }
    }, [method])
    return (
        <motion.div
            className="fixed z-30 overflow-scroll pt-[250px] flex justify-center md:pl-4 w-full h-full"
            variants={variants}
            initial="start"
            animate="end"
            ref={postListRef}
        >
            {children}
        </motion.div>
    )
}

export default WelcomeBackgroundList
