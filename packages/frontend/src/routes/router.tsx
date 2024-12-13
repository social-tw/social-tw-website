import { PATHS } from '@/constants/paths'
import { ProtectedRoute } from '@/features/auth'
import { ErrorBoundary, ResetStorage } from '@/features/shared'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import AboutPage from './app/about/page'
import AppLayout from './app/layout'
import NotificationPage from './app/notification/page'
import PostPage from './app/posts/[id]/page'
import PostListPage from './app/posts/page'
import HistoryPage from './app/profile/history/page'
import ProfilePage from './app/profile/page'
import ReputationPage from './app/profile/reputation/page'
import FullScreenLayout from './full-screen/layout'
import WritePostPage from './full-screen/write-post/page'
import OnboardingLayout from './onboarding/layout'
import LoginInternalPage from './onboarding/login/internal/page'
import LoginPage from './onboarding/login/page'
import SignupInternalPage from './onboarding/signup/internal/page'
import SignupPage from './onboarding/signup/page'
import FeaturesPage from './start/features/page'
import LaunchPage from './start/launch/page'
import StartLayout from './start/layout'
import WelcomePage from './start/welcome/page'
import TwitterCallbackPage from './twitter/callback/page'
import ReportDetailsPage from './app/reports/[id]/page'

const router = createBrowserRouter([
    {
        element: <StartLayout />,
        errorElement: <ErrorBoundary />,
        children: [
            {
                path: PATHS.WELCOME,
                element: <WelcomePage />,
            },
            {
                path: PATHS.LAUNCH,
                element: <LaunchPage />,
            },
            {
                path: PATHS.FEATURES,
                element: <FeaturesPage />,
            },
        ],
    },
    {
        path: PATHS.TWITTER_CALLBACK,
        element: <TwitterCallbackPage />,
    },
    {
        element: <OnboardingLayout />,
        errorElement: <ErrorBoundary />,
        children: [
            {
                path: PATHS.LOGIN,
                element: <LoginPage />,
            },
            {
                path: `${PATHS.LOGIN_INTERNAL}/:selectedSignupMethod`,
                element: <LoginInternalPage />,
            },
            {
                path: PATHS.SIGN_UP,
                element: <SignupPage />,
            },
            {
                path: PATHS.SIGN_UP_INTERNAL,
                element: <SignupInternalPage />,
            },
        ],
    },
    {
        element: <AppLayout />,
        errorElement: <ErrorBoundary />,
        children: [
            {
                element: <ProtectedRoute />,
                errorElement: <ResetStorage />,
                children: [
                    {
                        path: PATHS.HOME,
                        element: <PostListPage />,
                    },
                    {
                        path: PATHS.VIEW_POST,
                        element: <PostPage />,
                    },
                    {
                        path: PATHS.PROFILE,
                        element: <ProfilePage />,
                    },
                    {
                        path: PATHS.REPUTATION,
                        element: <ReputationPage />,
                    },
                    {
                        path: PATHS.HISTORY,
                        element: <HistoryPage />,
                    },
                    {
                        path: PATHS.NOTIFICATION,
                        element: <NotificationPage />,
                    },
                    {
                        path: PATHS.REPORT_DETAIL,
                        element: <ReportDetailsPage />,
                    },
                ],
            },
            {
                path: PATHS.ABOUT_US,
                element: <AboutPage />,
            },
        ],
    },
    {
        element: <FullScreenLayout />,
        children: [
            {
                element: <ProtectedRoute />,
                children: [
                    {
                        path: PATHS.WRITE_POST,
                        element: <WritePostPage />,
                    },
                ],
            },
        ],
    },
])

export default function Router() {
    return <RouterProvider router={router} />
}
