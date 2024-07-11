import { useToggle } from '@uidotdev/usehooks'
import { useNotifyCheckIn } from '../../hooks/useNotifyCheckIn/useNotifyCheckIn'
import CheckIn from '../CheckIn/CheckIn'
import DiscardCheckIn from '../DiscardCheckIn/DiscardCheckIn'
import CheckInSnackbar from './CheckSnackbar'

export default function CheckInNotification() {
    const [isOpenCheckIn, toggleCheckIn] = useToggle(false)
    const [isOpenDiscardCheckIn, toggleDiscardCheckIn] = useToggle(false)

    const { isOpen } = useNotifyCheckIn()

    if (!isOpen) {
        return null
    }

    return (
        <div data-testid="check-in-notification">
            <CheckInSnackbar
                onConfirm={() => toggleCheckIn(true)}
                onCancel={() => toggleDiscardCheckIn(true)}
            />
            <CheckIn
                open={isOpenCheckIn}
                onClose={() => toggleCheckIn(false)}
            />
            <DiscardCheckIn
                open={isOpenDiscardCheckIn}
                onClose={() => toggleDiscardCheckIn(false)}
                onCheckIn={() => {
                    toggleDiscardCheckIn(false)
                    toggleCheckIn(true)
                }}
            />
        </div>
    )
}
