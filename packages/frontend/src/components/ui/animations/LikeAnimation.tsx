import { motion, AnimatePresence } from 'framer-motion';
import likeIcon from '../../../assets/upvote.png'; // 確保這裡的路徑指向您的圖片文件

interface LikeAnimationProps {
    isLiked: boolean;
}

const LikeAnimation = ({ isLiked }: LikeAnimationProps) => {
    const variants = {
        initial: {
            scale: 0.5, // 從較小的大小開始
            opacity: 0, // 完全透明
        },
        animate: {
            scale: 1, // 動畫到正常大小
            opacity: 1, // 完全不透明
            transition: {
                type: 'spring',
                stiffness: 500,
                damping: 30
            }
        },
        exit: {
            scale: 0.5, // 結束時縮小回初始大小
            opacity: 0, // 淡出到透明
            transition: { duration: 0.5 }
        }
    };

    return (
        <AnimatePresence>
            {isLiked && (
                <motion.img
                    src={likeIcon} // 使用圖片代替文字表情
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    variants={variants}
                />
            )}
        </AnimatePresence>
    );
};

export default LikeAnimation;
