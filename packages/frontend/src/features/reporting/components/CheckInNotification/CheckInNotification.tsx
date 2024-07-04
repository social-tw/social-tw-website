import { useToggle } from '@uidotdev/usehooks'
import { useState } from 'react'
import CheckIn from '../CheckIn/CheckIn'
import CheckInSnackbar from './CheckSnackbar'

export default function CheckInNotification() {
    const [cancel, setCancel] = useState(false)
    const [open, toggle] = useToggle(false)

    const onConfirm = () => {
        setCancel(false)
        toggle()
    }

    const onCancel = () => {
        setCancel(true)
        toggle()
    }

    return (
        <div data-testid="check-in-notification">
            <CheckInSnackbar onConfirm={onConfirm} onCancel={onCancel} />
            <CheckIn cancel={cancel} open={open} onClose={toggle} />
        </div>
    )
}
