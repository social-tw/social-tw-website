// App.tsx

import React, { useCallback, useContext, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom'
import Login from './pages/Login'
import './styles/main.css'
import Home from './pages/Home'
import { User, UserContext } from './contexts/User'
import { observer } from 'mobx-react-lite'

const user = new User

const App = observer(() =>{
    
    useEffect(() => {
        const initUser = async () => {
            try {
                await user.load()
            } catch (error) {
                console.log(error)
            }
        }
        initUser()
    }, [user])

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
})

export default App

const rootElement = document.getElementById('root')
if (rootElement) {
    const root = createRoot(rootElement)
    root.render(<App />)
}
