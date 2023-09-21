import './styles/main.css'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { LoadingProvider } from './contexts/LoadingContext'
import AppLayout from './layouts/AppLayout'
import BaseLayout from './layouts/BaseLayout'
import OnboardingLayout from './layouts/OnboardingLayout'
import ErrorPage from './pages/ErrorPage'
import Login from './pages/Login'
import PostCreate from './pages/PostCreate'
import PostDetail from './pages/PostDetail'
import PostList from './pages/PostList'
import { UserProvider } from './contexts/User'
import Profile from './pages/Profile'

dayjs.extend(relativeTime)

const router = createBrowserRouter([
    {
        element: <OnboardingLayout />,
        errorElement: <ErrorPage />,
        children: [
            {
                path: 'login',
                element: <Login />,
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
                        element: <PostList />,
                    },
                    {
                        path: 'posts/:postId',
                        element: <PostDetail />,
                    },
                    {
                        path: 'profile',
                        element: <Profile />,
                    },
                ],
            },
            {
                path: 'write',
                element: <PostCreate />,
            },
        ],
    },
])

const App = () => {
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
