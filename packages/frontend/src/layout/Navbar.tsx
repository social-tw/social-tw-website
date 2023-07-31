import React, {useContext} from 'react'
import {BsTwitter} from 'react-icons/bs'
import TwitterLoginButton from '../components/shared/TwitterLoginButton'
import {UserContext} from '../contexts/User'
import {observer} from 'mobx-react-lite'
import UserDropdown from "../components/user/UserDropdown";

const Navbar: React.FC = observer(() => {
    const userContext = useContext(UserContext)

    return (
        <div className="navbar justify-center pr-6">
            <div className="sm:mr-auto">
                <img
                    src={require('../../public/unirep_logo_nobg.png')}
                    alt="UniRep logo"
                />
                <a className="text-xl font-bold">Unirep Social TW</a>
            </div>
            {userContext.hasSignedUp ? (
                <UserDropdown/>
            ) : (
                <div className="gap-4 sm:flex">
                    <div>
                        <TwitterLoginButton icon={BsTwitter}/>
                    </div>
                </div>
            )}
        </div>
    );
})

export default Navbar;
