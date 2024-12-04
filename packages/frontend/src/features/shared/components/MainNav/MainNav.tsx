import { ReactComponent as BellIcon } from '@/assets/svg/bell.svg'
import { ReactComponent as BookSearchIcon } from '@/assets/svg/book-search.svg'
import { ReactComponent as BookUserIcon } from '@/assets/svg/book-user.svg'
import { ReactComponent as HomeParagraphIcon } from '@/assets/svg/home-paragraph.svg'
import clsx from 'clsx'
import { NavLink } from 'react-router-dom'

export default function MainNav() {
    return (
        <nav className="space-y-9">
            <NavLink
                className={({ isActive }) =>
                    clsx(
                        'flex items-center gap-5',
                        isActive ? 'text-secondary' : 'text-white',
                    )
                }
                to="/"
            >
                <HomeParagraphIcon className="w-12 h-12" />
                <span className="text-xl font-bold ">貼文主頁</span>
            </NavLink>
            <NavLink
                className={({ isActive }) =>
                    clsx(
                        'flex items-center gap-5',
                        isActive ? 'text-secondary' : 'text-white',
                    )
                }
                to="/about"
                data-tour-step="6"
            >
                <BookSearchIcon className="w-12 h-12" />
                <span className="text-xl font-bold ">平台說明</span>
            </NavLink>
            <NavLink
                className={({ isActive }) =>
                    clsx(
                        'flex items-center gap-5',
                        isActive ? 'text-secondary' : 'text-white',
                    )
                }
                to="/notification"
            >
                <BellIcon className="w-12 h-12" />
                <span className="text-xl font-bold ">通知中心</span>
            </NavLink>
            <NavLink
                className={({ isActive }) =>
                    clsx(
                        'flex items-center gap-5',
                        isActive ? 'text-secondary' : 'text-white',
                    )
                }
                to="/profile"
            >
                <BookUserIcon className="w-12 h-12" />
                <span className="text-xl font-bold ">我的帳號</span>
            </NavLink>
        </nav>
    )
}
