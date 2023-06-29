// import './index.css'
import './styles/main.css'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Header from './pages/Header'
import PostCreate from './pages/PostCreate'
import PostList from './pages/PostList'
import Start from './pages/Start'

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/posts" element={<PostList />} />
                <Route path="/posts/create" element={<PostCreate />} />
                <Route path="/" element={<Header />}>
                    <Route index element={<Start />} />
                    <Route path="dashboard" element={<Dashboard />} />
                </Route>
            </Routes>
        </BrowserRouter>
    )
}

const rootElement = document.getElementById('root')
if (rootElement) {
    const root = createRoot(rootElement)
    root.render(<App />)
}
