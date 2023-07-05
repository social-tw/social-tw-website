import { Outlet } from 'react-router-dom'
import { BsTwitter } from 'react-icons/bs'

import Button from './shared/Button'
import Button2 from './Button'
import TwitterLoginButton from './shared/TwitterLoginButton'
import User from '../contexts/User'
import React from 'react'

const Navbar: React.FC = () => {
    const userContext = React.useContext(User)

    // TODO modify the button when user already login

    return (
        <div className="navbar justify-center pr-6">
            <div className="sm:mr-auto">
                <img
                    src={require('../../public/unirep_logo_nobg.png')}
                    alt="UniRep logo"
                />
                <a className="text-xl font-bold">Unirep Social TW</a>
            </div>
            <div className="hidden gap-4 sm:flex">
                <Button2 loadingText='Loading....'
                    onClick={() => {
                        return userContext.signup()
                    }}
                >
                    <span>註冊</span>
                </Button2>

                <Button color={`bg-btn-login`} text={`註冊 / 登入`} />
                <div>
                    <TwitterLoginButton icon={BsTwitter} />
                </div>
            </div>
        </div>
    )
}

export default Navbar
