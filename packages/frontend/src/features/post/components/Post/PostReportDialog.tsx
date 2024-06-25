import { Dialog } from '@/features/shared'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useReportPost } from '../../hooks/useReportPost'
import {
    ReportFormCtn,
    ReportFormDesc,
    ReportFormIntro,
    ReportFormReasons,
    ReportFormStepGroup,
    ReportFormStepLabel,
    ReportFormSubmitBtn,
    ReportFormSubmitFailure,
    ReportFormSubmitState,
    ReportFormSubmitSuccess,
    ReportFormSubmitting,
} from '../ReportForm'

interface PostReportDialogProps {
    isOpen: boolean
    onClose: () => void
}

export interface PortReportFormData {
    reason: number
    desc: string
}

export function PostReportDialog({ isOpen, onClose }: PostReportDialogProps) {
    const {
        register,
        handleSubmit,
        setValue,
        getValues,
        trigger,
        reset,
        formState: { errors },
    } = useForm<PortReportFormData>({
        defaultValues: {
            reason: -1,
            desc: '',
        },
    })

    const [submitState, setSubmitState] = useState<ReportFormSubmitState>(
        ReportFormSubmitState.NotSubmitted,
    )

    const { report } = useReportPost()
    const onSubmit = async (data: any) => {
        try {
            setSubmitState(ReportFormSubmitState.Submitting)
            await report(data)
            setSubmitState(ReportFormSubmitState.Success)
        } catch (e) {
            setSubmitState(ReportFormSubmitState.Failure)
        }
    }

    const shouldShowOriginalForm =
        submitState === ReportFormSubmitState.NotSubmitted
    const shouldShowSubmitting =
        submitState === ReportFormSubmitState.Submitting
    const shouldShowFail = submitState === ReportFormSubmitState.Failure
    const shouldShowSuccess = submitState === ReportFormSubmitState.Success

    return (
        <>
            {shouldShowOriginalForm && (
                <Dialog isOpen={isOpen} onClose={onClose}>
                    <ReportFormCtn onSubmit={handleSubmit(onSubmit)}>
                        <ReportFormIntro />
                        <ReportFormStepGroup>
                            <ReportFormStepLabel
                                title="1. 檢舉原因"
                                isRequired
                            />
                            <ReportFormReasons
                                register={register}
                                errors={errors}
                                setValue={setValue}
                                getValues={getValues}
                                trigger={trigger}
                            />
                        </ReportFormStepGroup>
                        <ReportFormStepGroup>
                            <ReportFormStepLabel
                                title="2. 檢舉描述"
                                isRequired
                            />
                            <ReportFormDesc
                                register={register}
                                errors={errors}
                            />
                        </ReportFormStepGroup>
                        <ReportFormSubmitBtn />
                    </ReportFormCtn>
                </Dialog>
            )}
            {shouldShowSubmitting && (
                <ReportFormSubmitting isOpen={shouldShowSubmitting} />
            )}
            {shouldShowFail && (
                <ReportFormSubmitFailure
                    isOpen={shouldShowFail}
                    onClose={() => {
                        reset(getValues())
                        setSubmitState(ReportFormSubmitState.NotSubmitted)
                    }}
                />
            )}
            {shouldShowSuccess && (
                <ReportFormSubmitSuccess
                    isOpen={shouldShowSuccess}
                    onClose={() => {
                        setSubmitState(ReportFormSubmitState.NotSubmitted)
                        reset()
                        onClose()
                    }}
                />
            )}
        </>
    )
}
