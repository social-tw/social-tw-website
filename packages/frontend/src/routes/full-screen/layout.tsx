import { Outlet } from 'react-router-dom'

export default function FullScreenLayout() {
    return (
        <div className="max-w-7xl min-h-screen mx-auto before:content-[' '] before:fixed before:top-0 before:left-0 before:-z-10 before:w-screen before:h-screen before:bg-[linear-gradient(200deg,#FF892A_-10%,#000000_15%,#2B2B2B_50%,#000000_85%,#52ACBC_110%)]">
            <Outlet />
        </div>
    )
}
