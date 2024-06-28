import { useAdjudicate } from '../../hooks/useAdjudicate/useAdjudicate'
import AdjudicateDialog from './AdjudicateDialog'
import AdjudicateFailure from './AdjudicateFailure'
import { ReportData } from './AdjudicateForm'
import AdjudicatePending from './AdjudicatePending'
import AdjudicateSuccess from './AdjudicateSuccess'

export default function Adjudicate({
    reportData,
    open = false,
    onClose = () => {},
}: {
    reportData?: ReportData
    open?: boolean
    onClose?: () => void
}) {
    const close = onClose

    const { isPending, isSuccess, isError, reset, mutate } = useAdjudicate()

    if (!reportData) {
        return null
    }

    return (
        <>
            <AdjudicateDialog
                reportData={reportData}
                open={open}
                onClose={close}
                onSubmit={(values) => {
                    mutate(values)
                    close()
                }}
            />
            <AdjudicatePending open={isPending} onClose={reset} />
            <AdjudicateSuccess open={isSuccess} onClose={reset} />
            <AdjudicateFailure open={isError} onClose={reset} />
        </>
    )
}
