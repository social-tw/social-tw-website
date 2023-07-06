import { Outlet } from 'react-router-dom'
import { BsTwitter } from 'react-icons/bs'
import { VscAccount } from 'react-icons/vsc'

import Button from '../components/shared/Button'
import TwitterLoginButton from '../components/shared/TwitterLoginButton'
import { UserContext } from '../contexts/User'
import React, { useContext } from 'react'



const Navbar: React.FC = () => {
    const userContext = useContext(UserContext); 
  
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
        <VscAccount size={32} />
      ) : (
        <div className="gap-4 sm:flex">
          <Button color={`bg-btn-login`} text={`註冊 / 登入`} />
          <div>
            <TwitterLoginButton icon={BsTwitter} />
          </div>
        </div>
      )}
    </div>
  );
}

export default Navbar;
