import './styles/main.css'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import BaseLayout from './pages/BaseLayout'
import ErrorPage from './pages/ErrorPage'
import Login from './pages/Login'
import PostCreate from './pages/PostCreate'
import PostList from './pages/PostList'
import { UserProvider } from './contexts/User'

dayjs.extend(relativeTime)

const router = createBrowserRouter([
    {
        element: <BaseLayout />,
        errorElement: <ErrorPage />,
        children: [
            {
                path: '/',
                element: <PostList />,
            },
            {
                path: 'write',
                element: <PostCreate />,
            },
            {
                path: 'login',
                element: <Login />,
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
