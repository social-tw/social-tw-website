import clsx from "clsx";
import { useEffect, useState } from "react";
import {
    Link,
    NavLink,
    Outlet,
    useLocation,
    useMatch,
    useNavigate,
} from 'react-router-dom'
import { useMediaQuery } from '@uidotdev/usehooks'
import ArrowLeftIcon from '../assets/arrow-left.svg'
import BellIcon from '../assets/bell.svg'
import HomeIcon from '../assets/home.svg'
import Logo from '../assets/logo.png'
import PersonCircleIcon from '../assets/person-circle.svg'
import SearchIcon from '../assets/search.svg'
import StarIcon from '../assets/star.svg'
import ErrorModal from '../components/modal/ErrorModal'
import { useUser } from '../contexts/User'
import MobileNavbar from '../components/layout/MobileNavbar'

export default function AppLayout() {
    const matchPath = useMatch('/')
    const location = useLocation()
    const { isLogin, signupStatus, setSignupStatus } = useUser()
    const [isShow, setIsShow] = useState(true)
    const navigate = useNavigate()

    let header = ''

    if (location.pathname === '/') {
        header = 'Home'
    } else if (location.pathname.startsWith('/posts')) {
        header = 'Posts'
    } else if (location.pathname === '/profile') {
        header = 'Profile 個人檔案'
    }

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

    if (isSmallDevice) {
        return (
            <div className="pt-8">
                <ErrorModal isOpen={signupStatus === 'error'} />
                <header className="relative flex items-center justify-center h-16 gap-2 px-4">
                    {!matchPath && (
                        <button
                            className="absolute flex items-center justify-center border rounded-lg left-4 w-9 h-9 bg-white/90 shadown-base border-stone-200"
                            onClick={goBack}
                        >
                            <ArrowLeftIcon className="w-4 h-4 text-black/90" />
                        </button>
                    )}
                    <img className="w-8 h-8" src={Logo} alt="brand logo" />
                    <h1 className="text-xl font-black text-white/90">
                        Unirep Social TW
                    </h1>
                </header>
                <main className="max-w-5xl mx-auto">
                    <Outlet />
                </main>
                <MobileNavbar 
                    isShow={isShow}
                    signupStatus={signupStatus}
                />
            </div>
        )
    } else {
        return (
            <div className="flex min-h-screen divide-x divide-neutral-600">
                <ErrorModal isOpen={signupStatus === 'error'} />
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
                            {header}
                        </h2>
                        {!matchPath && location.pathname !== '/profile' && (
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
                                            : 'text-white'
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
                                            : 'text-white'
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
                                            : 'text-white'
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
                                            : 'text-white'
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
                    </div>
                </section>
            </div>
        )
    }
}
