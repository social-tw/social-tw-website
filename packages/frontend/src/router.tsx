import { createBrowserRouter, redirect } from 'react-router-dom'
import { PATHS } from './constants/paths'
import AppLayout from './layouts/AppLayout'
import BaseLayout from './layouts/BaseLayout'
import OnboardingLayout from './layouts/OnboardingLayout'
import CreatePost from './pages/CreatePost'
import ErrorPage from './components/ErrorBoundary'
import Home from './pages/Home'
import { Login } from './pages/Login'
import { InternalLogin } from './pages/Login/InternalLogin'
import PostDetails from './pages/PostDetails'
import { History } from './pages/Profile/History'
import Profile from './pages/Profile/Profile'
import ProfileLayout from './pages/Profile/ProfileLayout'
import { Reputation } from './pages/Profile/Reputation'
import { Signup } from './pages/Signup'
import { InternalSignup } from './pages/Signup/InternalSignup'
import { Welcome } from './pages/Welcome'
import TwitterCallback from './pages/Login/TwitterCallback'
import ProtectedRoute from './components/ProtectedRoute'
import ResetStorage from './components/ResetStorage'

const router = createBrowserRouter([
    {
        element: <OnboardingLayout />,
        errorElement: <ErrorPage />,
        children: [
            {
                path: PATHS.WELCOME,
                element: <Welcome />,
            },
            {
                path: PATHS.LOGIN,
                element: <Login />,
            },
            {
                path: `${PATHS.LOGIN_INTERNAL}/:selectedSignupMethod`,
                element: <InternalLogin />,
            },
            {
                path: PATHS.SIGN_UP,
                element: <Signup />,
            },
            {
                path: PATHS.SIGN_UP_INTERNAL,
                element: <InternalSignup />,
            },
            {
                path: PATHS.TWITTER_CALLBACK,
                element: <TwitterCallback />,
            },
        ],
    },
    {
        element: (
            <ProtectedRoute>
                <BaseLayout />
            </ProtectedRoute>
        ),
        errorElement: <ResetStorage />,
        children: [
            {
                element: <AppLayout />,
                children: [
                    {
                        path: PATHS.HOME,
                        element: <Home />,
                    },
                    {
                        path: PATHS.VIEW_POST,
                        element: <PostDetails />,
                    },
                    {
                        path: 'profile',
                        element: <ProfileLayout />,
                        children: [
                            {
                                path: '',
                                element: <Profile />,
                            },
                            {
                                path: 'reputation',
                                element: <Reputation />,
                            },
                            {
                                path: 'history',
                                element: <History />,
                            },
                        ],
                    },
                ],
            },
            {
                path: PATHS.WRITE_POST,
                element: <CreatePost />,
            },
        ],
    },
    {
        path: '/explore',
        loader: () => {
            return redirect(PATHS.HOME)
        },
    },
    {
        path: '/notification',
        loader: () => {
            return redirect(PATHS.HOME)
        },
    },
])

export default router
