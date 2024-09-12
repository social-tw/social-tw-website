import { useAdjudicate } from '../../hooks/useAdjudicate/useAdjudicate'
import AdjudicateDialog from './AdjudicateDialog'
import AdjudicateFailure from './AdjudicateFailure'
import { type ReportData } from './AdjudicateForm'
import AdjudicatePending from './AdjudicatePending'

export default function Adjudicate({
    reportData,
    open = false,
    onClose = () => {},
}: {
    reportData?: ReportData
    open?: boolean
    onClose?: () => void
}) {
    const isOpen = open

    const { isIdle, isPending, isSuccess, isError, reset, mutate } =
        useAdjudicate()

    const close = () => {
        reset()
        onClose()
    }

    if (!reportData) {
        return null
    }

    return (
        <>
            <AdjudicateDialog
                reportData={reportData}
                open={isOpen && isIdle}
                onClose={close}
                onSubmit={(values) => mutate(values)}
            />
            <AdjudicatePending open={isPending || isSuccess} onClose={close} />
            <AdjudicateFailure open={isError} onClose={close} />
        </>
    )
}
