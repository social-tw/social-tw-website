// App.tsx

import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import './styles/main.css';
import Home from './pages/Home';
import { User, UserContext } from './contexts/User';

export default function App() {
    return (
        <UserContext.Provider value={new User()}> 
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
