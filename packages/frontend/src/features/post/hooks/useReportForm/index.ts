import { useCallback, useState } from 'react'
import { FieldValues, useForm } from 'react-hook-form'

enum ReportFormSubmitState {
    NotSubmitted = 'not-submitted',
    Submitting = 'submitting',
    Success = 'success',
    Failure = 'failure',
}

export function useReportForm(defaultValues: FieldValues) {
    const {
        register,
        handleSubmit,
        setValue,
        getValues,
        trigger,
        reset,
        formState: { errors },
    } = useForm<FieldValues>({ defaultValues })

    const [submitState, setSubmitState] = useState<ReportFormSubmitState>(
        ReportFormSubmitState.NotSubmitted,
    )

    const updateStateToSubmitting = () =>
        setSubmitState(ReportFormSubmitState.Submitting)
    const updateStateToSuccess = () =>
        setSubmitState(ReportFormSubmitState.Success)
    const updateStateToFailure = () =>
        setSubmitState(ReportFormSubmitState.Failure)

    const isNotSubmitted = submitState === ReportFormSubmitState.NotSubmitted
    const isSubmitting = submitState === ReportFormSubmitState.Submitting
    const isSubmitFailure = submitState === ReportFormSubmitState.Failure
    const isSubmitSuccess = submitState === ReportFormSubmitState.Success

    const resetToCurrentState = useCallback(() => {
        reset(getValues())
        setSubmitState(ReportFormSubmitState.NotSubmitted)
    }, [getValues, reset])

    const resetAll = useCallback(() => {
        reset()
        setSubmitState(ReportFormSubmitState.NotSubmitted)
    }, [reset])

    return {
        handleSubmit,
        register,
        setValue,
        getValues,
        trigger,
        errors,
        updateStateToSubmitting,
        updateStateToSuccess,
        updateStateToFailure,
        isNotSubmitted,
        isSubmitting,
        isSubmitFailure,
        isSubmitSuccess,
        resetToCurrentState,
        resetAll,
    }
}
