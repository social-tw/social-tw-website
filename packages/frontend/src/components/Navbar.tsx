import { Outlet } from 'react-router-dom'
import { BsTwitter } from 'react-icons/bs'

import Button from './shared/Button'
import TwitterLoginButton from './shared/TwitterLoginButton'

const Navbar: React.FC = () => {
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
                <Button color={`bg-btn-login`} text={`註冊 / 登入`} />
                <div>
                    <TwitterLoginButton
                        icon={BsTwitter}
                    />
                </div>
            </div>
        </div>
    )
}

export default Navbar
