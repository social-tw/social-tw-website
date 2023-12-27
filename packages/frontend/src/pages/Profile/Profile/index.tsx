import { HistoryButton } from './HistoryButton'
import { LogoutButton } from './LogoutButton'
import { ReputationButton } from './ReputationButton'

const Profile = () => {
    return (
        <div>
            <div className="w-full flex flex-col gap-4 md:flex-row md:gap-8">
                <HistoryButton />
                <ReputationButton />
                <LogoutButton />
            </div>
        </div>
    )
}

export default Profile
