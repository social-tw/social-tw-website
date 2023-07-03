import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Header from './pages/Header'
import Login from './pages/Login'
import './styles/main.css'

export default function App() {
    console.log(process.env)
    return (
        <BrowserRouter>
            <Routes>
                <Route path='/login' element={<Login/>} />
                <Route path="/" element={<Header />}>
                    {/* <Route index element={<Start />} />
                    <Route path="dashboard" element={<Dashboard />} /> */}
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
