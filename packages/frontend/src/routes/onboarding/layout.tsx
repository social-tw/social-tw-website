import { Outlet } from 'react-router-dom'

export default function OnboardingLayout() {
    return (
        <div className="relative">
            <div
                className="fixed w-screen h-screen -z-50"
                style={{
                    background:
                        'linear-gradient(250deg, #FF892A -15%, #8A5F35 5%, #000000 30%, #305F67 95%, #52ACBC 115%)',
                }}
            />
            <Outlet />
        </div>
    )
}
