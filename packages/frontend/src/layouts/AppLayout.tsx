import clsx from "clsx";
import { useEffect, useState } from "react";
import {
    Link, NavLink, Outlet, useLocation, useMatch, useNavigate
} from "react-router-dom";
import ArrowLeftIcon from "@/assets/arrow-left.svg";
import BellIcon from "@/assets/bell.svg";
import HomeIcon from "@/assets/home.svg";
import Logo from "@/assets/logo.png";
import PersonCircleIcon from "@/assets/person-circle.svg";
import SearchIcon from "@/assets/search.svg";
import StarIcon from "@/assets/star.svg";
import ActionNotification from "@/components/layout/ActionNotification";
import EpochInfo from "@/components/layout/EpochInfo";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import AuthErrorDialog from "@/components/login/AuthErrorDialog";
import { useUser } from "@/contexts/User";
import { useMediaQuery } from "@uidotdev/usehooks";

export default function AppLayout() {
    const matchPath = useMatch('/')
    const location = useLocation()
    const { isLogin, signupStatus, setSignupStatus } = useUser()
    const [isShow, setIsShow] = useState(true)
    const navigate = useNavigate()

    const headerTextOnDesktop = getDesktopHeaderTextByPath(location.pathname)
    const headerTextOnMobile = getMobileHeaderTextByPath(location.pathname)

    const goBack = () => {
        if (window.history.state && window.history.state.idx > 0) {
            navigate(-1)
        } else {
            navigate('/')
        }
    }

    useEffect(() => {
        if (isLogin && signupStatus === 'success') {
            setTimeout(() => {
                setSignupStatus('default')
                setIsShow(false)
            }, 1500)
            return
        }
        if (isLogin && signupStatus === 'default') {
            setIsShow(false)
        }
        if (!isLogin) {
            setIsShow(true)
            return
        }
    }, [isLogin])

    const isSmallDevice = useMediaQuery('only screen and (max-width : 768px)')
    const isShowingHeaderLogoOnSmallDevice =
        location.pathname !== '/profile' &&
        location.pathname !== '/profile/reputation' &&
        location.pathname !== '/profile/history'
    const isShowingGoBackButtonOnDesktop =
        !matchPath &&
        location.pathname !== '/profile' &&
        location.pathname !== '/profile/reputation' &&
        location.pathname !== '/profile/history'

    if (isSmallDevice) {
        return (
            <div className="pt-8">
                <AuthErrorDialog isOpen={signupStatus === 'error'} />
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
                        <img className="w-8 h-8" src={Logo} alt="brand logo" />
                    )}
                    <h1 className="text-xl font-black text-white/90">
                        {headerTextOnMobile}
                    </h1>
                </header>
                <section className="px-8 py-4 space-y-3">
                    <div className="max-w-sm mx-auto">
                        <EpochInfo />
                    </div>
                    <ActionNotification />
                </section>
                <main className="max-w-5xl mx-auto">
                    <Outlet />
                </main>
                <MobileBottomNav isShow={isShow} signupStatus={signupStatus} />
            </div>
        )
    } else {
        return (
            <div className="flex min-h-screen divide-x divide-neutral-600">
                <AuthErrorDialog isOpen={signupStatus === 'error'} />
                <section className="hidden basis-80 xl:block">
                    <div className="fixed top-0 h-full px-10 pt-20">
                        <div className="h-10 px-4 flex items-center gap-2 bg-[#3E3E3E] rounded-full text-white">
                            <SearchIcon className="w-5 h-5" />
                            <input
                                className="flex-1 text-base font-medium placeholder:text-white/60 focus:outline-none"
                                placeholder="Search"
                            />
                        </div>
                    </div>
                </section>
                <section className="flex-1 px-10 pt-20 divide-y divide-neutral-600">
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
                <section className="basis-80">
                    <div className="fixed top-0 h-full px-10 pt-20">
                        <Link className="flex items-center gap-2 mb-12" to="/">
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
                                <span className="text-xl font-bold ">Home</span>
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
                                to="/nofitication"
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
