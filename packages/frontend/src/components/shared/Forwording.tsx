import { motion } from 'framer-motion';
import LogoWhite from '../../assets/logo-white.png';
import Logo from '../../assets/logo.png';
import Downvote from '../../assets/downvote.png';
import Upvote from '../../assets/upvote.png';
import Comment from '../../assets/comment.png';

const Forwording = () => {
    const upvoteVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: [0, 1, 1, 0],
            transition: {
                times: [0, 0.2, 0.8, 1],
                duration: 3,
                ease: 'easeInOut',
            },
        },
    };

    const downvoteVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: [0, 1, 1, 0],
            transition: {
                delay: 3,
                times: [0, 0.2, 0.8, 1],
                duration: 3,
                ease: 'easeInOut',
            },
        },
    };

    const commentVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: [0, 1, 1, 0],
            transition: {
                delay: 6,
                times: [0, 0.2, 0.8, 1],
                duration: 3,
                ease: 'easeInOut',
            },
        },
    };

    const logoColoredVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: [0, 1, 1, 0],
            transition: {
                delay: 9,
                times: [0, 0.2, 0.8, 1],
                duration: 3,
                ease: 'easeInOut',
            },
        },
    };

    const logoWhiteVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                delay: 12,
                duration: 3,
                ease: 'easeInOut',
            },
        },
    };

    return (
        <div className="w-full h-full flex justify-center items-center">
            <div className="flex flex-col justiy-center items-center">
                <div className="relative mb-2 w-[120px] h-[120px]">
                    <motion.img
                        src={Logo}
                        className="absolute inset-0"
                        variants={logoColoredVariants}
                        initial="hidden"
                        animate="visible"
                    />
                    <motion.img
                        src={LogoWhite}
                        className="absolute inset-0"
                        variants={logoWhiteVariants}
                        initial="hidden"
                        animate="visible"
                    />
                    <motion.img
                        src={Comment}
                        className="absolute inset-0"
                        variants={commentVariants}
                        initial="hidden"
                        animate="visible"
                    />
                    <motion.img
                        src={Upvote}
                        className="absolute inset-0"
                        variants={upvoteVariants}
                        initial="hidden"
                        animate="visible"
                    />
                    <motion.img
                        src={Downvote}
                        className="absolute inset-0"
                        variants={downvoteVariants}
                        initial="hidden"
                        animate="visible"
                    />
                </div>
                <motion.h1 className="text-2xl text-neutral-200 font-semibold">
                    Unirep Social TW
                </motion.h1>
                <motion.h2 className="mb-6 mt-9 text-sm font-light text-white text-center tracking-wider">
                    嗨 🙌🏻 歡迎來到 Unirep Social TW <br />
                    提供你 100% 匿名身份、安全發言的社群！
                </motion.h2>
            </div>
        </div>
    );
};

export default Forwording;
