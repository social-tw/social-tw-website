import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CheckInCancellation from "./CheckInCancellation";
import CheckInDialog from "./CheckInDialog";
import CheckInFailure from "./CheckInFailure";
import CheckInPending from "./CheckInPending";
import CheckInSuccess from "./CheckInSuccess";

function useCheckIn() {
    return useMutation({
        mutationKey: ["check-in"],  
        mutationFn: async () => {},
    })
}

export default function CheckIn({
    cancel = false,
    open = false,
    onClose = () => {},
}: {
    cancel?: boolean
    open?: boolean
    onClose?: () => void,
}) {
    const [isCancel, setIsCancel] = useState(cancel)

    useEffect(() => {
        setIsCancel(cancel)
    }, [cancel])
    
    const { isPending, isSuccess, isError, reset, mutate } = useCheckIn()
    
    const close = () => onClose()

    const checkIn = () => {
        mutate()
        close()
    }

    const cancelCheckIn = () => {
        close()
    }

    const retry = () => {
        reset()
        checkIn()
    }

    const gotoCheckIn = () => {
        setIsCancel(false)
    }

    const navigate = useNavigate()

    const gotoProfilePage = () => {
        reset()
        navigate('/profile')
    }

    return (
        <>
            <CheckInDialog
                open={open && !isCancel}
                onClose={close}
                onConfirm={checkIn}
            />
            <CheckInCancellation
                open={open && isCancel}
                onClose={close}
                onConfirm={cancelCheckIn}
                onCheckIn={gotoCheckIn}
            />
            <CheckInPending
                open={isPending}
                onClose={reset}
            />
            <CheckInSuccess
                open={isSuccess}
                onClose={reset}
                onCheckout={gotoProfilePage}
            />
            <CheckInFailure
                open={isError}
                onClose={reset}
                onRetry={retry}
            />
        </>
    )
}
