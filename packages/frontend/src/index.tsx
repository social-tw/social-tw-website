import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from "./pages/Navbar";
import Landing from './pages/Landing'
import Start from './pages/Start'
import Dashboard from './pages/Dashboard'
import './index.css'

export default function App() {
    console.log(process.env)
    return (
        <BrowserRouter>
            <Navbar />
            <div style={{ marginTop: '4rem' }}>
                <Routes>
                    <Route path="/" element={<Landing />} />
                    <Route path="dashboard" element={<Dashboard />} />
                </Routes>
            </div>
        </BrowserRouter>
    )
}

const rootElement = document.getElementById('root')
if (rootElement) {
    const root = createRoot(rootElement)
    root.render(<App />)
}
