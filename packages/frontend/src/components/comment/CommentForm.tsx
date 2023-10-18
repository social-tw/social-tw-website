import { clsx } from 'clsx'
import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import Modal from '../modal/Modal'
import RichTextEditor from '../RichTextEditor'
import Avatar from '../../assets/avatar.png'

export interface CommentValues {
    content: string
}

export default function CommentForm({
    onCancel = () => {},
    onSubmit = () => {},
    onSubmitCancel = () => {},
    isSubmitCancellable = true,
    isSubmitCancelled = false,
    disabled = false,
}: {
    onCancel?: () => void
    onSubmit?: (values: CommentValues) => void
    onSubmitCancel?: () => void
    isSubmitCancellable?: boolean
    isSubmitCancelled?: boolean
    disabled?: boolean
}) {
    const { handleSubmit, control, reset, getValues, formState } =
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
        <>
            <form
                className={clsx('space-y-6', disabled && 'opacity-20')}
                onSubmit={handleSubmit(onSubmit)}
            >
                <section className="flex items-center justify-end gap-1">
                    <div className="w-[28px] h-[28px] rounded-full bg-gray-400 border-white border-4 flex items-center justify-center mr-auto">
                        <img src={Avatar} alt="Avatar" />
                    </div>
                    <button
                        className="btn btn-sm btn-ghost"
                        title="cancel a post"
                        type="button"
                        disabled={disabled}
                        onClick={_onCancel}
                    >
                        取消
                    </button>
                    <button
                        className="btn btn-sm btn-secondary"
                        title="submit a post"
                        type="submit"
                        disabled={disabled || !isValid || isPending}
                    >
                        {isPending ? '發佈中...' : '發佈文章'}
                    </button>
                </section>
                <section>
                    <Controller
                        name="content"
                        control={control}
                        rules={{ required: true }}
                        render={({ field }) => (
                            <RichTextEditor
                                ariaLabel="post editor"
                                onValueChange={field.onChange}
                                value={field.value}
                                namespace={field.name}
                                placeholder="你想留什麼言呢......？"
                                classes={{
                                    content:
                                        'min-h-[3rem] overflow-auto text-white text-lg tracking-wider',
                                    placeholder: 'text-gray-300 text-lg',
                                }}
                            />
                        )}
                    />
                </section>
            </form>
            <Modal
                isOpen={isPending}
                postion="absolute"
                background="bg-gradient-to-t from-black/100 to-white/0"
            >
                <div className="flex flex-col items-center justify-center h-full gap-4 backdrop-blur-sm">
                    <progress className="w-8/12 h-[12px] rounded-2xl progress bg-[#222222]" />
                    {isSubmitCancellable ? (
                        <button
                            className="btn btn-sm btn-primary"
                            onClick={onSubmitCancel}
                        >
                            取消發布
                        </button>
                    ) : (
                        <p className="text-lg font-semibold tracking-wider text-white">
                            已無法取消發布
                        </p>
                    )}
                </div>
            </Modal>
        </>
    )
}
