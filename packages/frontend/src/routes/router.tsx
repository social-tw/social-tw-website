import { RouterProvider, createBrowserRouter, redirect } from 'react-router-dom'
import OnboardingLayout from './onboarding/layout'
import LoginPage from './onboarding/login/page'
import LoginInternalPage from './onboarding/login/internal/page'
import SignupPage from './onboarding/signup/page'
import SignupInternalPage from './onboarding/signup/internal/page'
import WelcomePage from './welcome/page'
import TwitterCallbackPage from './twitter/callback/page'
import AppLayout from './app/layout'
import PostListPage from './app/posts/page'
import PostPage from './app/posts/[id]/page'
import ProfileLayout from './app/profile/layout'
import ProfilePage from './app/profile/page'
import HistoryPage from './app/profile/history/page'
import ReputationPage from './app/profile/reputation/page'
import FullScreenLayout from './full-screen/layout'
import WritePostPage from './full-screen/write-post/page'
import { ProtectedRoute } from '@/features/auth'
import { ErrorBoundary, ResetStorage } from '@/features/shared'
import { PATHS } from '@/constants/paths'
import NotificationPage from './app/notification/page'

const router = createBrowserRouter([
    {
        path: PATHS.WELCOME,
        element: <WelcomePage />,
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
        element: (
            <ProtectedRoute>
                <AppLayout />
            </ProtectedRoute>
        ),
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
                element: <ProfileLayout />,
                children: [
                    {
                        path: PATHS.PROFILE,
                        element: <ProfilePage />,
                    },
                    {
                        path: PATHS.REPUTATION,
                        element: <ReputationPage />,
                    },
                    {
                        path: PATHS.HISTORTY,
                        element: <HistoryPage />,
                    },
                ],
            },
            {
                path: PATHS.NOTIFICATION,
                element: <NotificationPage />
            }
        ],
    },
    {
        element: <FullScreenLayout />,
        children: [
            {
                path: PATHS.WRITE_POST,
                element: (
                    <ProtectedRoute>
                        <WritePostPage />
                    </ProtectedRoute>
                ),
            },
        ],
    },
    {
        path: '/explore',
        loader: () => {
            return redirect(PATHS.HOME)
        },
    },
])

export default function Router() {
    return <RouterProvider router={router} />
}
