import { clsx } from 'clsx'
import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import Avatar from '@/assets/img/avatar.png'
import { RichTextEditor } from '@/features/shared'

export interface CommentFormValues {
    content: string
}

export default function CommentFormMobile({
    isOpen = false,
    onCancel = () => {},
    onSubmit = () => {},
    disabled = false,
}: {
    isOpen: boolean
    onCancel?: () => void
    onSubmit?: (values: CommentFormValues) => void
    disabled?: boolean
}) {
    const { handleSubmit, control, reset, formState } =
        useForm<CommentFormValues>({
            defaultValues: {
                content: '',
            },
        })

    const { isValid, isSubmitting, isSubmitSuccessful } = formState

    useEffect(() => {
        if (isSubmitSuccessful) {
            reset({ content: '' })
        }
    }, [isSubmitSuccessful, reset])

    if (!isOpen) return null

    return (
        <div className="fixed bottom-0 z-50 w-screen p-4 bg-gray-900 border-t-2 border-gray-400">
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
                        title="cancel a comment"
                        type="button"
                        disabled={disabled}
                        onClick={onCancel}
                    >
                        取消
                    </button>
                    <button
                        className="btn btn-sm btn-secondary"
                        title="submit a comment"
                        type="submit"
                        disabled={disabled || !isValid || isSubmitting}
                    >
                        {isSubmitting ? '發佈中...' : '發佈留言'}
                    </button>
                </section>
                <section>
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
