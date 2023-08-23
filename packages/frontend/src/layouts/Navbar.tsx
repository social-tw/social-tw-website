import React, { useContext } from 'react'
import { VscAccount } from 'react-icons/vsc'
import { UserContext } from '../contexts/User'
import { observer } from 'mobx-react-lite'

const Navbar: React.FC = observer(() => {
    const userContext = useContext(UserContext)

    return (
        <div className="navbar justify-center pr-6">
            <div className="sm:mr-auto">
                <img
                    src={require('../../public/unirep_logo_nobg.png')}
                    alt="UniRep Logo"
                />
                <a className="text-xl font-bold">Unirep Social TW</a>
            </div>
            {userContext.hasSignedUp && <VscAccount size={32} />}
        </div>
    )
})

export default Navbar
