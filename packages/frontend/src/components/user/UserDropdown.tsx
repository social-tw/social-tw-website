import React, { useContext } from 'react'
import { VscAccount } from 'react-icons/vsc'
import { UserContext } from '../../contexts/User'

const UserDropdown: React.FC = () => {
    const userContext = useContext(UserContext)

    const handleLogout = (event: React.MouseEvent) => {
        event.preventDefault()
        userContext.logout()
    }

    return (
        <div className="dropdown dropdown-end">
            <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
                <VscAccount size={Number(32)} />
            </label>
            <ul
                tabIndex={0}
                className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52"
            >
                <li>
                    <a onClick={handleLogout}>Logout</a>
                </li>
            </ul>
        </div>
    )
}

export default UserDropdown
