import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import { PATHS } from './constants/paths'
import { ProtectedRoute } from './contexts/ProtectedRoute'
import { UserProvider } from './contexts/User'
import AppLayout from './layouts/AppLayout'
import BaseLayout from './layouts/BaseLayout'
import OnboardingLayout from './layouts/OnboardingLayout'
import ErrorPage from './pages/ErrorPage'
import { Login } from './pages/Login'
import { InternalLogin } from './pages/Login/InternalLogin'
import PostCreate from './pages/PostCreate'
import PostDetail from './pages/PostDetail'
import PostList from './pages/PostList'
import { History } from './pages/Profile/History'
import Profile from './pages/Profile/Profile'
import ProfileLayout from './pages/Profile/ProfileLayout'
import { Reputation } from './pages/Profile/Reputation'
import { Signup } from './pages/Signup'
import { InternalSignup } from './pages/Signup/InternalSignup'
import { Welcome } from './pages/Welcome'
import { socket } from './socket'

import './styles/main.css'

dayjs.extend(relativeTime)

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
        ],
    },
    {
        element: <BaseLayout />,
        errorElement: <ErrorPage />,
        children: [
            {
                element: <AppLayout />,
                errorElement: <ErrorPage />,
                children: [
                    {
                        path: '/',
                        element: (
                            <ProtectedRoute>
                                <PostList />
                            </ProtectedRoute>
                        ),
                    },
                    {
                        path: 'posts/:id',
                        element: <PostDetail />,
                    },
                    {
                        path: 'profile',
                        element: (
                            <ProtectedRoute>
                                <ProfileLayout />
                            </ProtectedRoute>
                        ),
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
                path: 'write',
                element: (
                    <ProtectedRoute>
                        <PostCreate />
                    </ProtectedRoute>
                ),
            },
        ],
    },
])

const App = () => {
    useEffect(() => {
        socket.on('connect', () => {
            console.log('Connected to the server!')
        })

        socket.on('disconnect', () => {
            console.log('Disconnected from the server!')
        })

        return () => {
            socket.off('connect')
            socket.off('disconnect')
        }
    }, [])
    return (
        <UserProvider>
            <RouterProvider router={router} />
        </UserProvider>
    )
}

export default App

const rootElement = document.getElementById('root')
if (rootElement) {
    const root = createRoot(rootElement)
    root.render(<App />)
}
