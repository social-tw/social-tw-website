import { clsx } from 'clsx'
import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import Avatar from '@/assets/avatar.png'
import RichTextEditor from '@/components/common/RichTextEditor'

export interface PostValues {
    content: string
}

export default function PostForm({
    onCancel = () => {},
    onSubmit = () => {},
    disabled = false,
    type = 'post',
}: {
    onCancel?: () => void
    onSubmit?: (values: PostValues) => void
    onSubmitCancel?: () => void
    isSubmitCancellable?: boolean
    isSubmitCancelled?: boolean
    disabled?: boolean
    type?: 'post' | 'comment'
}) {
    const { handleSubmit, control, reset, formState } = useForm<PostValues>({
        defaultValues: {
            content: '',
        },
    })

    const { isValid, isSubmitting, isSubmitSuccessful } = formState

    const isPending = isSubmitting

    const _onCancel = () => {
        reset({ content: '' })
        onCancel()
    }

    const placeholder =
        type === 'comment' ? '你想留什麼言呢......？' : undefined

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
                    {type === 'comment' && (
                        <div className="w-[28px] h-[28px] rounded-full bg-gray-400 border-white border-4 flex items-center justify-center mr-auto">
                            <img src={Avatar} alt="Avatar" />
                        </div>
                    )}
                    <button
                        className="btn btn-sm btn-ghost"
                        title="cancel a post"
                        type="button"
                        disabled={disabled}
                        onClick={_onCancel}
                    >
                        取消編輯
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
                                placeholder={placeholder}
                                classes={{
                                    content:
                                        'min-h-[3rem] overflow-auto text-white text-xl tracking-wide',
                                    placeholder: 'text-gray-300 text-xl',
                                }}
                            />
                        )}
                    />
                </section>
            </form>
        </>
    )
}
