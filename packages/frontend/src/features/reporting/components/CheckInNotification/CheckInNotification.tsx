import { useToggle } from '@uidotdev/usehooks'
import { useNotifyCheckIn } from '../../hooks/useNotifyCheckIn/useNotifyCheckIn'
import CheckIn from '../CheckIn/CheckIn'
import DiscardCheckIn from '../DiscardCheckIn/DiscardCheckIn'
import CheckInFloatingButton from './CheckFloatingButton'
import { useCheckInStore } from '../../hooks/useCheckIn/useCheckInStore'

export default function CheckInNotification() {
    const { isOpenCheckIn, toggleCheckIn } = useCheckInStore()
    const [isOpenDiscardCheckIn, toggleDiscardCheckIn] = useToggle(false)

    const { isOpen, discardCheckIn } = useNotifyCheckIn()

    if (!isOpen) {
        return null
    }

    return (
        <div data-testid="check-in-notification">
            <CheckInFloatingButton
                show={isOpen && !isOpenCheckIn && !isOpenDiscardCheckIn}
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
                onConfirm={() => {
                    discardCheckIn()
                }}
                onCheckIn={() => {
                    toggleDiscardCheckIn(false)
                    toggleCheckIn(true)
                }}
            />
        </div>
    )
}
