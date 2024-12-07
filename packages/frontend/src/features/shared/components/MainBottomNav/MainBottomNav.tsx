import { ReactComponent as AddIcon } from '@/assets/svg/add.svg'
import { ReactComponent as BellActiveIcon } from '@/assets/svg/bell-active.svg'
import { ReactComponent as BellIcon } from '@/assets/svg/bell.svg'
import { ReactComponent as BookSearchActiveIcon } from '@/assets/svg/book-search-active.svg'
import { ReactComponent as BookSearchIcon } from '@/assets/svg/book-search.svg'
import { ReactComponent as BookUserActiveIcon } from '@/assets/svg/book-user-active.svg'
import { ReactComponent as BookUserIcon } from '@/assets/svg/book-user.svg'
import { ReactComponent as HomeParagraphActiveIcon } from '@/assets/svg/home-paragraph-active.svg'
import { ReactComponent as HomeParagraphIcon } from '@/assets/svg/home-paragraph.svg'
import { PATHS } from '@/constants/paths'
import { motion } from 'framer-motion'
import { NavLink } from 'react-router-dom'

export default function MobileBottomNav() {
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
        <motion.nav
            className="
                fixed 
                z-40
                bottom-0 
                w-screen 
                h-20 
                flex 
                gap-2
                items-stretch 
                rounded-t-3xl
                bg-secondary/90
                shadow-[0_0_20px_0_rgba(0,0,0,0.6)_inset"
            variants={navVariants}
            initial="start"
            animate="end"
        >
            <NavLink
                className="flex items-center justify-center flex-1"
                to={PATHS.HOME}
            >
                {({ isActive }) =>
                    isActive ? (
                        <HomeParagraphActiveIcon className="w-14 h-14" />
                    ) : (
                        <HomeParagraphIcon className="w-14 h-14" />
                    )
                }
            </NavLink>
            <NavLink
                className="flex items-center justify-center flex-1"
                to={PATHS.ABOUT_US}
                data-tour-step="6"
            >
                {({ isActive }) =>
                    isActive ? (
                        <BookSearchActiveIcon className="w-14 h-14" />
                    ) : (
                        <BookSearchIcon className="w-14 h-14" />
                    )
                }
            </NavLink>
            <div className="relative flex justify-center flex-1">
                <NavLink
                    className="absolute flex items-center justify-center w-16 h-16 bg-white rounded-full bottom-8 drop-shadow-[0_4px_20px_rgba(0,0,0,0.6)]"
                    title="create a post"
                    to="/write-post"
                >
                    <AddIcon className="w-8 h-8 text-secondary" />
                </NavLink>
            </div>
            <NavLink
                className="flex items-center justify-center flex-1"
                to={PATHS.NOTIFICATION}
            >
                {({ isActive }) =>
                    isActive ? (
                        <BellActiveIcon className="w-14 h-14" />
                    ) : (
                        <BellIcon className="w-14 h-14" />
                    )
                }
            </NavLink>
            <NavLink
                className="flex items-center justify-center flex-1"
                to={PATHS.PROFILE}
            >
                {({ isActive }) =>
                    isActive ? (
                        <BookUserActiveIcon className="w-14 h-14" />
                    ) : (
                        <BookUserIcon className="w-14 h-14" />
                    )
                }
            </NavLink>
        </motion.nav>
    )
}
