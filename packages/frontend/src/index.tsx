// App.tsx

import React, { useContext, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom'
import Login from './pages/Login'
import './styles/main.css'
import Home from './pages/Home'
import { User, UserContext } from './contexts/User'

const user = new User

export default function App() {
    return (
        <UserContext.Provider value={user}> 
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Home />}>
                        <Route path="/login" element={<Login />} />
                    </Route>
                </Routes>
            </BrowserRouter>
        </UserContext.Provider>
    )
}

const rootElement = document.getElementById('root')
if (rootElement) {
    const root = createRoot(rootElement)
    root.render(<App />)
}
