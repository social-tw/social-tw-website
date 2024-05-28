import { VscAccount } from 'react-icons/vsc'
import { useLogout } from '@/hooks/useLogout/useLogout'

export default function UserDropdown() {
    const { logout } = useLogout()

    const handleLogout = () => {
        logout()
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
                    <button onClick={handleLogout}>Logout</button>
                </li>
            </ul>
        </div>
    )
}
