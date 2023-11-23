import { clsx } from "clsx";
import { motion } from "framer-motion";
import React from "react";
import { NavLink } from "react-router-dom";
import AddIcon from "@/assets/add.svg";
import BellIcon from "@/assets/bell.svg";
import HomeIcon from "@/assets/home.svg";
import PersonCircleIcon from "@/assets/person-circle.svg";
import StarIcon from "@/assets/star.svg";
import SignUpLoadingModal from "@/components/login/SignupPendingTransition";
import { SignupStatus } from "@/contexts/User";

interface MobileNavbarProps {
    isShow: boolean
    signupStatus: SignupStatus
}

const MobileBottomNav: React.FC<MobileNavbarProps> = ({
    isShow,
    signupStatus,
}) => {
    const navVariants = {
        start: { y: 100 },
        end: {
            y: 0,
            transition: {
                delay: 0,
                duration: 1,
                ease: 'easeInOut',
            },
        },
    }

    return (
        <>
            {isShow ? (
                <div
                    className={clsx(
                        `fixed bottom-0 w-screen`,
                        signupStatus === 'default' ? 'h-56' : 'h-24'
                    )}
                >
                    <SignUpLoadingModal
                        status={signupStatus}
                        isOpen={true}
                        opacity={0}
                    />
                </div>
            ) : (
                <motion.nav
                    className="
                            fixed 
                            bottom-0 
                            w-screen 
                            h-20 
                            flex 
                            items-stretch 
                            rounded-t-3xl
                            bg-gradient-to-r 
                            from-secondary 
                            to-primary/80 
                            shadow-[0_0_20px_0_rgba(0,0,0,0.6)_inset"
                    variants={navVariants}
                    initial="start"
                    animate="end"
                >
                    <NavLink
                        className="flex items-center justify-center flex-1"
                        to="/"
                    >
                        <HomeIcon className="text-white w-14 h-14" />
                    </NavLink>
                    <NavLink
                        className="flex items-center justify-center flex-1"
                        to="/explore"
                    >
                        <StarIcon className="text-white w-14 h-14" />
                    </NavLink>
                    <div className="relative flex justify-center flex-1">
                        <NavLink
                            className="absolute flex items-center justify-center w-16 h-16 bg-white rounded-full bottom-8 drop-shadow-[0_4px_20px_rgba(0,0,0,0.6)]"
                            title="create a post"
                            to="/write"
                        >
                            <AddIcon className="w-8 h-8 text-secondary" />
                        </NavLink>
                    </div>
                    <NavLink
                        className="flex items-center justify-center flex-1"
                        to="/nofitication"
                    >
                        <BellIcon className="text-white w-14 h-14" />
                    </NavLink>
                    <NavLink
                        className="flex items-center justify-center flex-1"
                        to="/profile"
                    >
                        <PersonCircleIcon className="text-white w-14 h-14" />
                    </NavLink>
                </motion.nav>
            )}
        </>
    )
}

export default MobileBottomNav
