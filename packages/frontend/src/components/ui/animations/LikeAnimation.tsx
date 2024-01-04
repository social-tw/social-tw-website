import { motion, AnimatePresence } from 'framer-motion'
import upvoteImage from '../../../assets/upvote.png'
import downvoteImage from '../../../assets/downvote.png'
import { VoteAction } from '../../../types'
import React from 'react'

interface LikeAnimationProps {
    isLiked: boolean
    imgType: VoteAction
}

enum Images {
    UPVOTE = upvoteImage,
    DOWNVOTE = downvoteImage,
}

const LikeAnimation = ({ isLiked, imgType }: LikeAnimationProps) => {
    let image

    if (imgType === VoteAction.UPVOTE) {
        image = Images.UPVOTE
    } else {
        image = Images.DOWNVOTE
    }
    return (
        <AnimatePresence>
            {isLiked && (
                <motion.img
                    style={{
                        position: 'fixed',
                        top: '50%',
                        left: '50%',
                    }}
                    initial={{ x: '-50%', opacity: 0, scale: 0 }}
                    animate={{ x: '-50%', opacity: 1, scale: 3 }}
                    exit={{ opacity: 0, scale: 5 }}
                    transition={{
                        opacity: { duration: 0.8, delay: 0.5 },
                        scale: { duration: 0.8, delay: 0.5 },
                        ease: [0, 0.71, 0.2, 1.01],
                    }}
                    src={image as unknown as string}
                ></motion.img>
            )}
        </AnimatePresence>
    )
}

export default LikeAnimation
