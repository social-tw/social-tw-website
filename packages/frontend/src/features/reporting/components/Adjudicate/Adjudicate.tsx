import { useMutation } from '@tanstack/react-query'
import AdjudicateDialog from './AdjudicateDialog'
import AdjudicateFailure from './AdjudicateFailure'
import { AdjudicateFormValues, ReportData } from './AdjudicateForm'
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

    const { isPending, isSuccess, isError, reset, mutate } = useMutation({
        mutationKey: [],
        mutationFn: async (values: AdjudicateFormValues) => {
            // TODO: implement this
        },
        onMutate: (variables) => {},
        onError: (_error, _variables, context) => {},
        onSuccess: (data, _variables, context) => {},
        onSettled: () => {
            close()
        },
    })

    if (!reportData) {
        return null
    }

    return (
        <>
            <AdjudicateDialog
                reportData={reportData}
                open={open}
                onClose={close}
                onSubmit={mutate}
            />
            <AdjudicatePending open={isPending} onClose={reset} />
            <AdjudicateSuccess open={isSuccess} onClose={reset} />
            <AdjudicateFailure open={isError} onClose={reset} />
        </>
    )
}
