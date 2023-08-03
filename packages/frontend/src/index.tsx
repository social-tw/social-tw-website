// App.tsx

import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, useSearchParams } from 'react-router-dom'
import Login from './pages/Login'
import './styles/main.css'
import Home from './pages/Home'
import { User, UserContext } from './contexts/User'
import { observer } from 'mobx-react-lite'
// import useInitUser from './hooks/useInitUser'
import ToasterContext from './contexts/ToasterContext'
import { LoadingProvider } from './contexts/LoadingContext'
import { useEffect } from 'react'

const user = new User;

const App = () => {
    return (
        <UserContext.Provider value={user}>
            <ToasterContext />
            <LoadingProvider>
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
};

export default App;

const rootElement = document.getElementById('root')
if (rootElement) {
    const root = createRoot(rootElement)
    root.render(<App />)
};
