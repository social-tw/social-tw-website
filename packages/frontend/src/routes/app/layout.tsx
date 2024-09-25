import Logo from '@/assets/img/logo.png'
import { ReactComponent as ArrowLeftIcon } from '@/assets/svg/arrow-left.svg'
import { ReactComponent as BellIcon } from '@/assets/svg/bell.svg'
import { ReactComponent as HomeIcon } from '@/assets/svg/home.svg'
import { ReactComponent as PersonCircleIcon } from '@/assets/svg/person-circle.svg'
import { ReactComponent as SearchIcon } from '@/assets/svg/search.svg'
import { ReactComponent as StarIcon } from '@/assets/svg/star.svg'
import { ErrorDialog } from '@/features/auth'
import { ActionNotification, EpochInfo } from '@/features/core'
import {
    AdjudicationNotification,
    CheckInNotification,
} from '@/features/reporting'
import { useBackgroundReputationClaim } from '@/features/reporting/hooks/useBackgroundReputationClaim/useBackgroundReputationClaim'
import { MobileBottomNav } from '@/features/shared'
import { ForbidActionDialog } from '@/features/shared/components/Dialog/ForbidActionDialog'
import {
    closeForbidActionDialog,
    useDialogStore,
} from '@/features/shared/stores/dialog'
import { useMediaQuery } from '@uidotdev/usehooks'
import clsx from 'clsx'
import {
    Link,
    NavLink,
    Outlet,
    useLocation,
    useMatch,
    useNavigate,
} from 'react-router-dom'

function NotificationContainer({ children }: { children: React.ReactNode }) {
    return (
        <div
            id="notifications"
            className="fixed z-20 right-4 bottom-28 lg:left-10 lg:right-auto lg:bottom-20"
        >
            {children}
        </div>
    )
}

export default function AppLayout() {
    const matchPath = useMatch('/')

    const location = useLocation()

    const navigate = useNavigate()

    useBackgroundReputationClaim()

    const headerTextOnDesktop = getDesktopHeaderTextByPath(location.pathname)
    const headerTextOnMobile = getMobileHeaderTextByPath(location.pathname)

    const goBack = () => {
        if (window.history.state && window.history.state.idx > 0) {
            navigate(-1)
        } else {
            navigate('/')
        }
    }

    const isSmallDevice = useMediaQuery('only screen and (max-width : 1024px)')
    const isShowingHeaderLogoOnSmallDevice =
        location.pathname !== '/profile' &&
        location.pathname !== '/profile/reputation' &&
        location.pathname !== '/profile/history'
    const isShowingGoBackButtonOnDesktop =
        !matchPath &&
        location.pathname !== '/profile' &&
        location.pathname !== '/profile/reputation' &&
        location.pathname !== '/profile/history'

    const isForbidActionDialogOpen = useDialogStore(
        (state) => state.forbidAction,
    )

    if (isSmallDevice) {
        return (
            <div className="max-w-7xl min-h-screen mx-auto before:content-[' '] before:fixed before:top-0 before:left-0 before:-z-10 before:w-screen before:h-screen before:bg-[linear-gradient(200deg,#FF892A_-10%,#000000_15%,#2B2B2B_50%,#000000_85%,#52ACBC_110%)]">
                <div className="pt-8">
                    <header className="relative flex items-center justify-center h-16 gap-2 px-4">
                        {!matchPath && (
                            <button
                                className="absolute flex items-center justify-center border rounded-lg left-4 w-9 h-9 bg-white/90 shadown-base border-stone-200"
                                onClick={goBack}
                            >
                                <ArrowLeftIcon className="w-4 h-4 text-black/90" />
                            </button>
                        )}
                        {isShowingHeaderLogoOnSmallDevice && (
                            <img
                                className="w-8 h-8"
                                src={Logo}
                                alt="brand logo"
                            />
                        )}
                        <h1 className="text-xl font-black text-white/90">
                            {headerTextOnMobile}
                        </h1>
                    </header>
                    <section className="p-4 space-y-3">
                        <div className="max-w-xs mx-auto">
                            <EpochInfo />
                        </div>
                        <ActionNotification />
                    </section>
                    <main className="max-w-5xl pb-20 mx-auto">
                        <Outlet />
                    </main>
                    <MobileBottomNav />
                    <ErrorDialog />
                </div>
                <NotificationContainer>
                    <AdjudicationNotification />
                    <CheckInNotification />
                </NotificationContainer>
            </div>
        )
    } else {
        return (
            <div className="max-w-7xl min-h-screen mx-auto before:content-[' '] before:fixed before:top-0 before:left-0 before:-z-10 before:w-screen before:h-screen before:bg-[linear-gradient(200deg,#FF892A_-10%,#000000_15%,#2B2B2B_50%,#000000_85%,#52ACBC_110%)]">
                <div className="grid grid-cols-[1fr_26rem] xl:grid-cols-[20rem_1fr_20rem] min-h-screen divide-x divide-neutral-600">
                    <section className="hidden xl:block">
                        <div className="fixed top-0 h-full px-10 pt-20">
                            <div className="h-10 px-4 flex items-center gap-2 bg-[#3E3E3E] rounded-full text-white">
                                <SearchIcon className="w-5 h-5" />
                                <input
                                    className="flex-1 text-base font-medium bg-transparent placeholder:text-white/60 focus:outline-none"
                                    placeholder="Search"
                                />
                            </div>
                        </div>
                    </section>
                    <section className="px-10 pt-20 divide-y divide-neutral-600">
                        <div className="flex gap-5 pb-6">
                            <h2 className="text-2xl font-bold text-secondary">
                                {headerTextOnDesktop}
                            </h2>
                            {isShowingGoBackButtonOnDesktop && (
                                <button
                                    className="flex items-center justify-center border rounded-lg w-9 h-9 bg-white/90 shadown-base border-stone-200"
                                    onClick={goBack}
                                >
                                    <ArrowLeftIcon className="w-4 h-4 text-black/90" />
                                </button>
                            )}
                        </div>
                        <main>
                            <Outlet />
                        </main>
                    </section>
                    <section>
                        <div className="fixed top-0 h-full px-10 pt-20">
                            <Link
                                className="flex items-center gap-2 mb-12"
                                to="/"
                            >
                                <img
                                    className="w-12 h-12"
                                    src={Logo}
                                    alt="brand logo"
                                />
                                <h1 className="text-xl font-black text-white/90">
                                    Unirep Social TW
                                </h1>
                            </Link>
                            <nav className="space-y-9">
                                <NavLink
                                    className={({ isActive }) =>
                                        clsx(
                                            'flex items-center gap-8',
                                            isActive
                                                ? 'text-secondary'
                                                : 'text-white',
                                        )
                                    }
                                    to="/"
                                >
                                    <HomeIcon className="w-14 h-14" />
                                    <span className="text-xl font-bold ">
                                        Home
                                    </span>
                                </NavLink>
                                <NavLink
                                    className={({ isActive }) =>
                                        clsx(
                                            'flex items-center gap-8',
                                            isActive
                                                ? 'text-secondary'
                                                : 'text-white',
                                        )
                                    }
                                    to="/explore"
                                >
                                    <StarIcon className="w-14 h-14" />
                                    <span className="text-xl font-bold ">
                                        Explore
                                    </span>
                                </NavLink>
                                <NavLink
                                    className={({ isActive }) =>
                                        clsx(
                                            'flex items-center gap-8',
                                            isActive
                                                ? 'text-secondary'
                                                : 'text-white',
                                        )
                                    }
                                    to="/notification"
                                >
                                    <BellIcon className="w-14 h-14" />
                                    <span className="text-xl font-bold ">
                                        Notification
                                    </span>
                                </NavLink>
                                <NavLink
                                    className={({ isActive }) =>
                                        clsx(
                                            'flex items-center gap-8',
                                            isActive
                                                ? 'text-secondary'
                                                : 'text-white',
                                        )
                                    }
                                    to="/profile"
                                >
                                    <PersonCircleIcon className="w-14 h-14" />
                                    <span className="text-xl font-bold ">
                                        Profile
                                    </span>
                                </NavLink>
                            </nav>
                            <div className="mt-16 space-y-3">
                                <EpochInfo />
                                <ActionNotification />
                            </div>
                        </div>
                    </section>
                    <ErrorDialog />
                </div>
                <NotificationContainer>
                    <AdjudicationNotification />
                    <CheckInNotification />
                </NotificationContainer>
                <ForbidActionDialog
                    isOpen={isForbidActionDialogOpen}
                    onClose={closeForbidActionDialog}
                />
            </div>
        )
    }
}

function getDesktopHeaderTextByPath(path: string): string {
    if (path === '/') {
        return 'Home'
    } else if (path.startsWith('/posts')) {
        return 'Posts'
    } else if (path === '/profile') {
        return 'Profile 我的帳號'
    } else if (path === '/profile/history') {
        return 'Profile 我的帳號 > 歷史紀錄'
    } else if (path === '/profile/reputation') {
        return 'Profile 我的帳號 > 信譽分數'
    } else {
        return ''
    }
}

function getMobileHeaderTextByPath(path: string): string {
    if (path === '/profile') {
        return '我的帳號'
    } else if (path === '/profile/history') {
        return '歷史紀錄'
    } else if (path === '/profile/reputation') {
        return '信譽分數'
    } else {
        return 'Unirep Social TW'
    }
}
