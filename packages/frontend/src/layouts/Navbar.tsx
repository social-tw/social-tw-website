import React, { useContext } from 'react';
import { VscAccount } from 'react-icons/vsc';
import { useUser } from '../contexts/User';

const Navbar: React.FC = () => {
    const { hasSignedUp } = useUser()

    return (
        <div className="navbar justify-center pr-6">
            <div className="sm:mr-auto">
                <img
                    src={require('../../public/unirep_logo_colored.png')}
                    alt="UniRep Logo"
                />
                <a className="text-xl font-bold">Unirep Social TW</a>
            </div>
            { hasSignedUp && <VscAccount size={32} /> }
        </div>
    );
}

export default Navbar;
