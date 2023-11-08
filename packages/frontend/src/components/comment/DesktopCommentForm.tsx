import React, { useEffect } from 'react'
import Modal from '../modal/Modal'
import { Controller, useForm } from 'react-hook-form'
import RichTextEditor from '../RichTextEditor'
import { CommentValues } from './MobileCommentForm'
import { GrFormClose } from 'react-icons/gr'

interface DesktopCommentFormProps {
    isOpen: boolean
    onCancel?: () => void
    onSubmit?: (values: CommentValues) => void
    onSubmitCancel?: () => void
    isSubmitCancellable?: boolean
    isSubmitCancelled?: boolean
    disabled?: boolean
}

const DesktopCommentForm: React.FC<DesktopCommentFormProps> = ({
    isOpen = false,
    onCancel = () => { },
    onSubmit = () => { },
    onSubmitCancel = () => { },
    isSubmitCancellable = true,
    isSubmitCancelled = false,
    disabled = false,
}) => {
    const { handleSubmit, control, reset, formState } =
        useForm<CommentValues>({
            defaultValues: {
                content: '',
            },
        })

    const { isValid, isSubmitting, isSubmitSuccessful } = formState

    const isPending = !isSubmitCancelled && isSubmitting

    const _onCancel = () => {
        reset({ content: '' })
        onCancel()
    }

    useEffect(() => {
        if (isSubmitSuccessful) {
            reset({ content: '' })
        }
    }, [isSubmitSuccessful, reset])

    return (
        <Modal isOpen={isOpen} postion='fixed'>
            <div className='flex items-center justify-center w-full h-full'>
                <div className='relative p-12 flex flex-col gap-6 bg-white/95 max-w-[600px] overflow-auto tracking-wider text-black rounded-lg w-[580px]'>
                    <GrFormClose
                        className="absolute top-3 right-3 cursor-pointer text-[#051532]"
                        size={30}
                        onClick={onCancel}
                    />
                    <form
                        className='flex flex-col justify-center items-center gap-8'
                        onSubmit={handleSubmit(onSubmit)}
                    >
                        <section className='w-full'>
                            <Controller
                                name="content"
                                control={control}
                                rules={{ required: true }}
                                render={({ field }) => (
                                    <RichTextEditor
                                        ariaLabel="comment editor"
                                        onValueChange={field.onChange}
                                        value={field.value}
                                        namespace={field.name}
                                        placeholder="你想留什麼言呢......？"
                                        classes={{
                                            content:
                                                'overflow-auto text-black text-[15px] tracking-wider w-full rounded-xl h-[170px] bg-[#D9D9D9] p-4',
                                            placeholder: 'text-black',
                                        }}
                                    />
                                )}
                            />
                        </section>
                        <section className='w-[285px]'>
                            <button
                                className="w-full h-14 rounded-lg bg-[#52ACBC]/90 text-white/90 flex justify-center items-center text-xl font-bold tracking-[30%]"
                                title="submit a post"
                                type="submit"
                                disabled={disabled || !isValid || isPending}
                            >
                                發佈留言
                            </button>
                        </section>
                    </form>
                </div>
            </div>
        </Modal>
    )
}

export default DesktopCommentForm
