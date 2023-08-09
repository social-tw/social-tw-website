// App.tsx
// import './index.css'
import './styles/main.css'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { LoadingProvider } from './contexts/LoadingContext'
import ToasterContext from './contexts/ToasterContext'
import { User, UserContext } from './contexts/User'
import Home from './pages/Home'
import Login from './pages/Login'
import PostCreate from './pages/PostCreate'
import PostList from './pages/PostList'

dayjs.extend(relativeTime)

const user = new User()

const App = () => {
    return (
        <UserContext.Provider value={user}>
            <ToasterContext />
            <LoadingProvider>
                <BrowserRouter>
                    <Routes>
                        <Route path="/" element={<Home />}>
                            <Route path="/login" element={<Login />} />
                            <Route path="/posts" element={<PostList />} />
                            <Route
                                path="/posts/create"
                                element={<PostCreate />}
                            />
                        </Route>
                    </Routes>
                </BrowserRouter>
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
