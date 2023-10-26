import React, { useEffect } from "react"
import Modal from "../../Modal"
import { Controller, useForm } from 'react-hook-form'
import { GrFormClose } from 'react-icons/gr'

interface CommentReportDialogProps {
    isOpen: boolean
    onClose: () => void
}

interface ReportFormValues {
    content: string
}

const CommentReportModal: React.FC<CommentReportDialogProps> = ({
    isOpen = false,
    onClose = () => { }
}) => {
    const { control, handleSubmit, reset, formState } = useForm<ReportFormValues>({
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
        <Modal isOpen={isOpen} postion="fixed" background={'bg-black/70'}>
            <div className="flex flex-col justify-center items-center h-full p-4">
                <div className="relative p-8 flex flex-col gap-6 bg-white/95 max-w-[600px] overflow-auto tracking-wider text-black rounded-lg">
                    <GrFormClose
                        className="absolute top-4 right-4 cursor-pointer"
                        size={30}
                        onClick={onClose}
                    />
                    {isSubmitSuccessful ?
                        (
                            <>
                                <section className="py-8 md:px-12">
                                    <p className="text-base font-medium text-black">
                                        親愛的用戶：
                                        <br />
                                        <br />
                                        您的留言檢舉已送出審查，若經審查符合被檢舉條件，該則留言將被刪除
                                    </p>
                                </section>
                            </>
                        )
                        :
                        (
                            <>
                                <section className="pt-8 md:px-12">
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
                                <form onSubmit={handleSubmit(onSubmit)} className="w-full flex flex-col gap-8">
                                    <Controller
                                        name="content"
                                        control={control}
                                        render={
                                            ({ field }) => (
                                                <textarea {...field}
                                                    className="overflow-auto text-black text-[15px] tracking-wider w-full rounded h-[170px] bg-[#D9D9D9] outline-none p-4 resize-none"
                                                    id="textInput"
                                                />
                                            )
                                        }
                                    />
                                    <button
                                        className="w-full h-14 rounded-lg bg-primary/90 text-white/90 flex justify-center items-center text-xl font-bold tracking-[30%]"
                                        type="submit"
                                    >
                                        確認檢舉
                                    </button>
                                </form>
                            </>
                        )}
                </div>
            </div>
        </Modal>
    )
}

export default CommentReportModal