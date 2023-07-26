import React, { useContext, useEffect } from 'react'
import AuthForm from '../components/login/AuthForm'
import { observer } from 'mobx-react-lite'

const Login: React.FC = observer(() => {

    return (
        <div
            className="flex h-full flex-col justify-center"
        >
            <div className="sm:mx-auto sm:w-full sm:max-w-md px-8">
                <h2 className="mt-6 text-center text-3xl font-bold tracking-wider">
                    歡迎回來!
                </h2>
                <h2 className="mt-6 text-center text-m font-medium">
                    使用第三方平台進行登入，即表示同意Unirep Social的使用者規章及條款
                </h2>
            <AuthForm />
            </div>
        </div>
    )
})

export default Login
