import './styles/main.css'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { LoadingProvider } from './contexts/LoadingContext'
import ToasterContext from './contexts/ToasterContext'
import { User, UserContext } from './contexts/User'
import BaseLayout from './pages/BaseLayout'
import ErrorPage from './pages/ErrorPage'
import Login from './pages/Login'
import PostCreate from './pages/PostCreate'
import PostList from './pages/PostList'

dayjs.extend(relativeTime)

const user = new User()

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
        <UserContext.Provider value={user}>
            <ToasterContext />
            <LoadingProvider>
                <RouterProvider router={router} />
            </LoadingProvider>
        </UserContext.Provider>
    )
}

export default App

const rootElement = document.getElementById('root')
if (rootElement) {
    const root = createRoot(rootElement)
    root.render(<App />)
}
