import { ReactComponent as BellActiveIcon } from '@/assets/svg/bell-active.svg'
import { ReactComponent as BellIcon } from '@/assets/svg/bell.svg'
import { ReactComponent as BookSearchActiveIcon } from '@/assets/svg/book-search-active.svg'
import { ReactComponent as BookSearchIcon } from '@/assets/svg/book-search.svg'
import { ReactComponent as BookUserActiveIcon } from '@/assets/svg/book-user-active.svg'
import { ReactComponent as BookUserIcon } from '@/assets/svg/book-user.svg'
import { ReactComponent as HomeParagraphActiveIcon } from '@/assets/svg/home-paragraph-active.svg'
import { ReactComponent as HomeParagraphIcon } from '@/assets/svg/home-paragraph.svg'
import { PATHS } from '@/constants/paths'
import clsx from 'clsx'
import { NavLink } from 'react-router-dom'
import { useNotificationStore } from '@/features/notification/stores/useNotificationStore'

export default function MainSideNav() {
    const showNotificationDot = useNotificationStore((state) => state.showDot)
    const clearNotificationDot = useNotificationStore(
        (state) => state.clearNotificationDot,
    )
    const handleBellClick = () => {
        clearNotificationDot()
    }

    return (
        <nav className="space-y-9">
            <NavLink className="flex items-center gap-5" to={PATHS.HOME}>
                {({ isActive }) => (
                    <>
                        {isActive ? (
                            <HomeParagraphActiveIcon className="w-12 h-12" />
                        ) : (
                            <HomeParagraphIcon className="w-12 h-12" />
                        )}
                        <span
                            className={clsx(
                                'text-xl font-bold',
                                isActive ? 'text-secondary' : 'text-white',
                            )}
                        >
                            貼文主頁
                        </span>
                    </>
                )}
            </NavLink>
            <NavLink
                className="flex items-center gap-5"
                to={PATHS.ABOUT_US}
                data-tour-step="6"
            >
                {({ isActive }) => (
                    <>
                        {isActive ? (
                            <BookSearchActiveIcon className="w-12 h-12" />
                        ) : (
                            <BookSearchIcon className="w-12 h-12" />
                        )}
                        <span
                            className={clsx(
                                'text-xl font-bold',
                                isActive ? 'text-secondary' : 'text-white',
                            )}
                        >
                            平台說明
                        </span>
                    </>
                )}
            </NavLink>
            <NavLink
                className={({ isActive }) =>
                    clsx(
                        'relative flex items-center gap-8',
                        isActive
                            ? 'text-secondary'
                            : 'text-white',
                    )
                }
                to={PATHS.NOTIFICATION}
                onClick={handleBellClick}
            >
                {showNotificationDot ? (
                    <BellActiveIcon className="w-full h-full" />
                ) : (
                    <BellIcon className="w-full h-full" />
                )}
                <span className="text-xl font-bold">
                    通知中心
                </span>
            </NavLink>
            <NavLink className="flex items-center gap-5" to={PATHS.PROFILE}>
                {({ isActive }) => (
                    <>
                        {isActive ? (
                            <BookUserActiveIcon className="w-12 h-12" />
                        ) : (
                            <BookUserIcon className="w-12 h-12" />
                        )}
                        <span
                            className={clsx(
                                'text-xl font-bold',
                                isActive ? 'text-secondary' : 'text-white',
                            )}
                        >
                            我的帳號
                        </span>
                    </>
                )}
            </NavLink>
        </nav>
    )
}
