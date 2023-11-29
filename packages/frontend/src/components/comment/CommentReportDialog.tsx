import { clsx } from 'clsx'
import React from 'react'
import { Controller, useForm } from 'react-hook-form'
import Dialog from '@/components/common/Dialog'

interface CommentReportDialogProps {
    isOpen: boolean
    onClose: () => void
}

interface ReportFormValues {
    content: string
}

const CommentReportModal: React.FC<CommentReportDialogProps> = ({
    isOpen = false,
    onClose = () => {},
}) => {
    const { control, handleSubmit, reset, formState } =
        useForm<ReportFormValues>({
            defaultValues: {
                content: '',
            },
        })

    const { isValid, isSubmitting, isSubmitSuccessful } = formState

    const onSubmit = (data: ReportFormValues) => {
        //TODO: Handle form submission here
        console.log(data)
    }

    return (
        <Dialog isOpen={isOpen} onClose={onClose}>
            {isSubmitSuccessful ? (
                <>
                    <section className="p-6 md:px-12">
                        <p className="text-base font-medium text-black">
                            親愛的用戶：
                            <br />
                            <br />
                            您的留言檢舉已送出審查，若經審查符合被檢舉條件，該則留言將被刪除
                        </p>
                    </section>
                </>
            ) : (
                <>
                    <section className="p-6 md:px-12">
                        <p className="text-base font-medium text-black">
                            親愛的用戶：
                            <br />
                            <br />
                            請您再檢舉這則留言前，幫我們審慎評估此留言內容是否含有下列任一內容：
                            <br />
                            1. 不雅、攻擊性或令人不安的言論。
                            <br />
                            2. 不實或具有誤導性的資訊。
                            <br />
                            3. 版權侵犯或其他違法內容。
                            <br />
                            4. 垃圾郵件或廣告宣傳等商業內容。
                            <br />
                            若您確定要檢舉這次留言，請您於以下欄位填寫檢舉原因，謝謝！
                        </p>
                    </section>
                    <section className="p-6 md:px-12">
                        <form
                            onSubmit={handleSubmit(onSubmit)}
                            className="flex flex-col w-full gap-8"
                        >
                            <Controller
                                name="content"
                                control={control}
                                rules={{ required: true }}
                                render={({ field }) => (
                                    <textarea
                                        {...field}
                                        className="overflow-auto text-black text-[15px] tracking-wider w-full rounded h-[170px] bg-[#D9D9D9] outline-none p-4 resize-none"
                                        id="textInput"
                                    />
                                )}
                            />
                            <button
                                className={clsx(
                                    'w-full h-14 rounded-lg text-white/90 flex justify-center items-center text-xl font-bold tracking-[30%]',
                                    isValid ? 'bg-primary/90' : 'bg-[#8F8F8F]'
                                )}
                                type="submit"
                                disabled={!isValid || isSubmitting}
                            >
                                確認檢舉
                            </button>
                        </form>
                    </section>
                </>
            )}
        </Dialog>
    )
}

export default CommentReportModal
