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
    const { isIdle, isPending, isSuccess, isError, reset, mutate } =
        useCheckIn()

    const close = () => {
        reset()
        onClose()
    }

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

    if (!open) {
        return null
    }

    return (
        <>
            <CheckInDialog open={isIdle} onClose={close} onConfirm={checkIn} />
            <CheckInPending open={isPending} onClose={close} />
            <CheckInSuccess
                open={isSuccess}
                onClose={close}
                onCheckout={gotoProfilePage}
            />
            <CheckInFailure open={isError} onClose={close} onRetry={retry} />
        </>
    )
}
