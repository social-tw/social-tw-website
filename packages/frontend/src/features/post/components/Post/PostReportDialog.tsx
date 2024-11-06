import ReportContent from '@/features/reporting/components/Adjudicate/ReportContent'
import { Dialog } from '@/features/shared'
import { useState } from 'react'
import { FieldValues, useForm, UseFormGetValues } from 'react-hook-form'
import { useReportPost } from '../../hooks/useReportPost/useReportPost'
import {
    REGISTER_ID_DESC,
    REGISTER_ID_REASON,
    ReportFormCategories,
    ReportFormCtn,
    ReportFormIntro,
    ReportFormReason,
    ReportFormStepGroup,
    ReportFormStepLabel,
    ReportFormSubmitBtn,
    ReportFormSubmitFailure,
    ReportFormSubmitSuccess,
    ReportFormSubmitting,
} from '../ReportForm'

interface PostReportDialogProps {
    postId: string
    content: string
    isOpen: boolean
    onClose: () => void
}

const defaultValues = {
    [`${REGISTER_ID_REASON}`]: -1,
    [`${REGISTER_ID_DESC}`]: '',
}

export function PostReportDialog({
    postId,
    content,
    isOpen,
    onClose,
}: PostReportDialogProps) {
    const [step, setStep] = useState<number>(1)

    const {
        register,
        handleSubmit,
        setValue,
        getValues,
        trigger,
        reset: resetForm,
        formState: { errors },
    } = useForm<FieldValues>({ defaultValues })

    const {
        isIdle,
        isPending,
        isError,
        isSuccess,
        reportPost,
        reset: resetState,
    } = useReportPost()

    const onSubmit = handleSubmit(async (data) => {
        try {
            await reportPost({
                postId,
                category: data[`${REGISTER_ID_REASON}`],
                reason: data[`${REGISTER_ID_DESC}`],
            })
        } catch (error) {}
    })

    const onFailureResubmit = useFailureResubmitDialogFlow({
        resetForm,
        resetState,
        getValues,
    })

    const onCloseDialog = useCloseDialogFlow({
        resetForm,
        resetState,
        onClose,
    })

    return (
        <>
            {step === 1 && (
                <Dialog isOpen={isOpen} onClose={onCloseDialog}>
                    <div className="py-6 px-12 flex flex-col items-center justify-between gap-16">
                        <p className="mt-2 tracking-wide leading-7">
                            親愛的用戶：
                            <br />
                            <br />
                            Unirep Social
                            Taiwan為一去中心化的用戶自治管理社群平台，藉由透過檢舉不當內容的方式來
                            <span className="font-bold text-secondary">
                                維持社群的安全與健康
                            </span>
                            。
                            檢舉的流程會需要你選擇檢舉原因類別、填寫檢舉原因描述，並送出申請。
                            <span className="font-bold text-secondary">
                                提交的檢舉案將交由平台上的 5
                                位隨機用戶進行審核評判
                            </span>
                            。若檢舉案審核評判通過，你的聲譽分數會加 3
                            分，反之，則你的聲譽分數降 1 分。
                            <span className="font-bold text-secondary">
                                因此請審慎填寫檢舉案的內容
                            </span>
                            ，以幫助其他用戶進行評判，並避免聲譽分數被降低的風險。
                        </p>
                        <button
                            className="w-80 h-14 rounded-lg text-white/90 flex justify-center items-center text-xl font-bold tracking-[30%] bg-primary/90"
                            type="button"
                            onClick={() => setStep(2)}
                        >
                            確認檢舉
                        </button>
                    </div>
                </Dialog>
            )}

            {step === 2 && isIdle && (
                <Dialog isOpen={isOpen} onClose={onCloseDialog}>
                    <ReportFormCtn onSubmit={onSubmit}>
                        <ReportFormIntro />
                        <ReportContent content={content} />
                        <ReportFormStepGroup>
                            <ReportFormStepLabel
                                title="1. 檢舉原因"
                                isRequired
                            />
                            <ReportFormCategories
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
                            <ReportFormReason
                                register={register}
                                errors={errors}
                            />
                        </ReportFormStepGroup>
                        <ReportFormSubmitBtn />
                    </ReportFormCtn>
                </Dialog>
            )}

            {isPending && <ReportFormSubmitting />}
            {isError && (
                <ReportFormSubmitFailure
                    onClose={onCloseDialog}
                    onResubmit={onFailureResubmit}
                />
            )}
            {isSuccess && <ReportFormSubmitSuccess onClose={onCloseDialog} />}
        </>
    )
}

function useCloseDialogFlow({
    resetForm,
    resetState,
    onClose,
}: {
    resetForm: () => void
    resetState: () => void
    onClose: () => void
}) {
    return () => {
        resetForm()
        resetState()
        onClose()
    }
}

function useFailureResubmitDialogFlow({
    resetForm,
    resetState,
    getValues,
}: {
    resetForm: (values: FieldValues) => void
    resetState: () => void
    getValues: UseFormGetValues<FieldValues>
}) {
    return () => {
        resetForm(getValues())
        resetState()
    }
}
