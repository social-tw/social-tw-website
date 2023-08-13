import './styles/main.css'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { LoadingProvider } from './contexts/LoadingContext'
import { User, UserContext } from './contexts/User'
import AppLayout from './layouts/AppLayout'
import BaseLayout from './layouts/BaseLayout'
import OnboardingLayout from './layouts/OnboardingLayout'
import ErrorPage from './pages/ErrorPage'
import Login from './pages/Login'
import PostCreate from './pages/PostCreate'
import PostDetail from './pages/PostDetail'
import PostList from './pages/PostList'

dayjs.extend(relativeTime)

const user = new User()

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
        <UserContext.Provider value={user}>
            <LoadingProvider>
                <RouterProvider router={router} />
            </LoadingProvider>
            <Toaster />
        </UserContext.Provider>
    )
}

export default App

const rootElement = document.getElementById('root')
if (rootElement) {
    const root = createRoot(rootElement)
    root.render(<App />)
}
