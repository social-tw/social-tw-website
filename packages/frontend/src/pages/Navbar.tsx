import { Outlet } from 'react-router-dom'
import Button from '../components/shared/Button'
import TwitterLoginButton from '../components/shared/TwitterLoginButton'

const Navbar: React.FC = () => {
    return (
        <div className='flex h-full flex-col justify-center'>
            <div data-theme="dark" className="navbar justify-center pr-6">
                <div className="sm:mr-auto">
                    <img
                        src={require('../../public/unirep_logo_nobg.png')}
                        alt="UniRep logo"
                    />
                    <a className="text-xl font-bold">Unirep Social TW</a>
                </div>
                <div className="hidden gap-4 sm:flex">
                    <Button color={`bg-btn-login`} text={`註冊 / 登入`} />
                    <TwitterLoginButton 
                        theme={"dark_short"}
                    />
                </div>
            </div>
            <Outlet />
        </div>
    )
}

export default Navbar
