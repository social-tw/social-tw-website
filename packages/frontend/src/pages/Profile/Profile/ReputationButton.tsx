import { RiLogoutBoxRLine } from 'react-icons/ri'
import { useNavigate } from 'react-router-dom'
import { CyanButton } from '../../../components/buttons/CyanButton'

// TODO: update the icon
export const ReputationButton = () => {
    const navigate = useNavigate()
    const handleLogout = () => {
        navigate('/profile/reputation')
    }
    return (
        <CyanButton
            isLoading={false}
            onClick={handleLogout}
            title="信譽分數"
            icon={RiLogoutBoxRLine}
            start={true}
            text="lg"
            iconSize={24}
        />
    )
}
