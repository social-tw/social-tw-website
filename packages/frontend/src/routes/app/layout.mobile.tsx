import Logo from '@/assets/img/logo.png'
import { ReactComponent as ArrowLeftIcon } from '@/assets/svg/arrow-left.svg'
import { PATHS } from '@/constants/paths'
import { ErrorDialog, SignupPending } from '@/features/auth'
import { ActionWidget, UITour } from '@/features/core'
import {
    AdjudicationNotification,
    CheckInNotification,
} from '@/features/reporting'
import { MainBottomNav, NotificationContainer } from '@/features/shared'
import { ForbidActionDialog } from '@/features/shared/components/Dialog/ForbidActionDialog'
import {
    closeForbidActionDialog,
    useDialogStore,
} from '@/features/shared/stores/dialog'
import { Outlet, useLocation, useMatch, useNavigate } from 'react-router-dom'

export default function MobileAppLayout() {
    const isForbidActionDialogOpen = useDialogStore(
        (state) => state.forbidAction,
    )

    return (
        <div className="max-w-7xl min-h-screen mx-auto before:content-[' '] before:fixed before:top-0 before:left-0 before:-z-10 before:w-screen before:h-screen before:bg-[linear-gradient(200deg,#FF892A_-10%,#000000_15%,#2B2B2B_50%,#000000_85%,#52ACBC_110%)]">
            <div>
                <MobileLayoutHeader />
                <main className="max-w-5xl pb-20 mx-auto">
                    <Outlet />
                </main>
            </div>
            <MainBottomNav />
            <NotificationContainer>
                <AdjudicationNotification />
                <CheckInNotification />
            </NotificationContainer>
            <SignupPending />
            <UITour />
            <ForbidActionDialog
                isOpen={isForbidActionDialogOpen}
                onClose={closeForbidActionDialog}
            />
            <ErrorDialog />
        </div>
    )
}

function MobileLayoutHeader() {
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

    const isPostPage = useMatch('/posts/:id')

    const isContainingPosts = isHomePage || isPostPage

    return (
        <header className="sticky top-0 z-10 pt-8 backdrop-blur-sm backdrop-brightness-90">
            <div className="relative flex items-center justify-center h-12 gap-2 px-4">
                {!isHomePage && (
                    <button
                        className="absolute flex items-center justify-center border rounded-lg left-4 w-9 h-9 bg-white/90 shadown-base border-stone-200"
                        onClick={goBack}
                    >
                        <ArrowLeftIcon className="w-4 h-4 text-black/90" />
                    </button>
                )}
                {isContainingPosts && (
                    <img className="w-8 h-8" src={Logo} alt="brand logo" />
                )}
                <h1 className="text-xl font-black text-white/90">
                    {headerText}
                </h1>
            </div>
            {isContainingPosts && (
                <section className="px-4 py-2 space-y-3">
                    <div className="max-w-[21rem] mx-auto">
                        <ActionWidget />
                    </div>
                </section>
            )}
        </header>
    )
}

function getHeaderTextByPath(path: string): string {
    switch (path) {
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
            return '信譽分數'
        }
        default: {
            return 'Unirep Social TW'
        }
    }
}
