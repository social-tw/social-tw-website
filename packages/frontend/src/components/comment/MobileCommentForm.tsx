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
    isOpen = false,
    onCancel = () => {},
    onSubmit = () => {},
    onSubmitCancel = () => {},
    isSubmitCancellable = true,
    isSubmitCancelled = false,
    disabled = false,
}: {
    isOpen: boolean
    onCancel?: () => void
    onSubmit?: (values: CommentValues) => void
    onSubmitCancel?: () => void
    isSubmitCancellable?: boolean
    isSubmitCancelled?: boolean
    disabled?: boolean
}) {
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

    if (!isOpen) return null

    return (
        <div className="fixed w-screen bottom-0 z-50 bg-gray-900/60 border-gray-400 border-t-2 p-4">
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
        </div>
    )
}
