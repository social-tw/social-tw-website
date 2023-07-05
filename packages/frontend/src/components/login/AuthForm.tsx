import React from 'react'
import { BsTwitter } from 'react-icons/bs'
import TwitterLoginButton from '../shared/TwitterLoginButton'

const AuthForm: React.FC = () => {
    return (
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <div className="flex justify-center px-4 py-8 shadow sm:rounded-lg sm:px-10">
                <TwitterLoginButton 
                  icon={BsTwitter}
                />
            </div>
        </div>
    )
}

export default AuthForm
