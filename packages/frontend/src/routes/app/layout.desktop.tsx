import LogoImage from '@/assets/img/logo.png'
import { ReactComponent as ArrowLeftIcon } from '@/assets/svg/arrow-left.svg'
import { PATHS } from '@/constants/paths'
import { ErrorDialog, SignupPending } from '@/features/auth'
import { ActionWidget, UITour } from '@/features/core'
import {
    AdjudicationNotification,
    CheckInNotification,
} from '@/features/reporting'
import { MainSideNav, NotificationContainer } from '@/features/shared'
import { ForbidActionDialog } from '@/features/shared/components/Dialog/ForbidActionDialog'
import SearchInput from '@/features/shared/components/Inputs/SearchInput'
import {
    closeForbidActionDialog,
    useDialogStore,
} from '@/features/shared/stores/dialog'
import {
    Link,
    Outlet,
    useLocation,
    useMatch,
    useNavigate,
} from 'react-router-dom'

export default function DesktopAppLayout() {
    const isForbidActionDialogOpen = useDialogStore(
        (state) => state.forbidAction,
    )

    return (
        <div className="max-w-screen-2xl min-h-screen mx-auto before:content-[' '] before:fixed before:top-0 before:left-0 before:-z-10 before:w-screen before:h-screen before:bg-[linear-gradient(200deg,#FF892A_-10%,#000000_15%,#2B2B2B_50%,#000000_85%,#52ACBC_110%)]">
            <div className="grid grid-cols-[1fr_27rem] xl:grid-cols-[27rem_1fr_27rem] min-h-screen divide-x divide-neutral-600">
                <section className="hidden xl:block">
                    <div className="fixed top-0 h-full px-10 pt-20 w-[27rem]">
                        <SearchInput />
                    </div>
                </section>
                <section>
                    <DesktopLayoutHeader />
                    <main className="px-10">
                        <Outlet />
                    </main>
                </section>
                <section>
                    <div className="fixed top-0 h-full px-10 py-20 w-[27rem]">
                        <Logo />
                        <MainSideNav />
                        <div className="mt-16 space-y-3">
                            <ActionWidget />
                        </div>
                    </div>
                </section>
            </div>
            <NotificationContainer>
                <AdjudicationNotification />
                <CheckInNotification />
            </NotificationContainer>
            <ForbidActionDialog
                isOpen={isForbidActionDialogOpen}
                onClose={closeForbidActionDialog}
            />
            <ErrorDialog />
            <SignupPending />
            <UITour />
        </div>
    )
}

function Logo() {
    return (
        <Link className="flex items-center gap-2 mb-12" to="/">
            <img className="w-12 h-12" src={LogoImage} alt="brand logo" />
            <h1 className="text-xl font-black text-white/90">
                Unirep Social TW
            </h1>
        </Link>
    )
}

function DesktopLayoutHeader() {
    const navigate = useNavigate()

    const goBack = () => {
        if (window.history.state && window.history.state.idx > 0) {
            navigate(-1)
        } else {
            navigate('/')
        }
    }

    const location = useLocation()

    const headerText = getHeaderTextByPath(location.pathname)

    const isHomePage = useMatch('/')

    return (
        <div className="sticky top-0 z-10 gap-5 px-10 backdrop-blur">
            <header className="flex items-center gap-5 pt-20 pb-6">
                {!isHomePage && (
                    <button
                        className="flex items-center justify-center border rounded-lg w-9 h-9 bg-white/90 shadown-base border-stone-200"
                        onClick={goBack}
                    >
                        <ArrowLeftIcon className="w-4 h-4 text-black/90" />
                    </button>
                )}
                <h2 className="text-2xl font-bold text-white/90">
                    {headerText}
                </h2>
            </header>
            <hr className="border-t border-neutral-600" />
        </div>
    )
}

function getHeaderTextByPath(path: string): string {
    const reportMatch = /^\/reports\/[^/]+$/.test(path)
    if (reportMatch) {
        return '檢舉評判結果詳情'
    }

    switch (path) {
        case PATHS.HOME: {
            return '貼文主頁'
        }
        case PATHS.ABOUT_US: {
            return '平台說明'
        }
        case PATHS.NOTIFICATION: {
            return '通知中心'
        }
        case PATHS.PROFILE: {
            return '我的帳號'
        }
        case PATHS.HISTORY: {
            return '歷史紀錄'
        }
        case PATHS.REPUTATION: {
            return '聲譽分數'
        }
        default: {
            return ''
        }
    }
}
