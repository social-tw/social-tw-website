// App.tsx

import React, { useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import './styles/main.css'
import Home from './pages/Home'
import { User, UserContext } from './contexts/User'
import { observer } from 'mobx-react-lite'
import { LoadingProvider } from './contexts/Loading'
import ToasterContext from './contexts/ToasterContext'

const user = new User

const App = observer(() => {

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
            <LoadingProvider>
                <ToasterContext />
                <BrowserRouter>
                    <Routes>
                        <Route path="/" element={<Home />}>
                            <Route path="/login" element={<Login />} />
                        </Route>
                    </Routes>
                </BrowserRouter>
            </LoadingProvider>
        </UserContext.Provider>
    )
})

export default App

const rootElement = document.getElementById('root')
if (rootElement) {
    const root = createRoot(rootElement)
    root.render(<App />)
}
