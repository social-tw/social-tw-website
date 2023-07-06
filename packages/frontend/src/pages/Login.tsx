import React from 'react'
import AuthForm from '../components/login/AuthForm'
import User from '../contexts/User'

const Login: React.FC = () => {
    const userContext = React.useContext(User)
    
    return (
        <div
            data-theme="dark"
            className="flex h-full flex-col justify-center sm:px-6 lg-px-8"
        >
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-bold tracking-wider">
                    歡迎回來!
                </h2>
                <h2 className="mt-6 text-center text-m font-medium tracking-wider">
                    使用第三方平台進行登入，即表示同意Unirep Social的使用者規章及條款
                </h2>
            </div>            
            <AuthForm />
        </div>
    )
}

export default Login
