import { useNavigate } from 'react-router-dom'
import { useCheckIn } from '../../hooks/useCheckIn/useCheckIn'
import CheckInDialog from './CheckInDialog'
import CheckInFailure from './CheckInFailure'
import CheckInPending from './CheckInPending'
import CheckInSuccess from './CheckInSuccess'

export default function CheckIn({
    open = false,
    onClose = () => {},
}: {
    open?: boolean
    onClose?: () => void
}) {
    const { isPending, isSuccess, isError, reset, mutate } = useCheckIn()

    const close = () => onClose()

    const checkIn = () => {
        mutate()
        close()
    }

    const retry = () => {
        reset()
        checkIn()
    }

    const navigate = useNavigate()

    const gotoProfilePage = () => {
        reset()
        navigate('/profile')
    }

    return (
        <>
            <CheckInDialog open={open} onClose={close} onConfirm={checkIn} />
            <CheckInPending open={isPending} onClose={reset} />
            <CheckInSuccess
                open={isSuccess}
                onClose={reset}
                onCheckout={gotoProfilePage}
            />
            <CheckInFailure open={isError} onClose={reset} onRetry={retry} />
        </>
    )
}
