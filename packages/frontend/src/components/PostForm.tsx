import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import RichTextEditor from './RichTextEditor'
import { useUser } from '../contexts/User'
import { clsx } from 'clsx'

export interface PostValues {
    content: string
}

export default function PostForm({
    onCancel = () => {},
    onSaveDraft = () => {},
    onFetchDraft = () => {},
    onSubmit = () => {},
    isShow = true
}: {
    onCancel?: () => void
    onSaveDraft?: (values: PostValues) => void
    onFetchDraft?: () => void
    onSubmit?: (values: PostValues) => void
    isShow?: boolean
}) {
    const { handleSubmit, control, reset, getValues, formState } =
        useForm<PostValues>({
            defaultValues: {
                content: '',
            },
        })

    const { isValid, isSubmitting, isSubmitSuccessful } = formState

    const _onCancel = () => {
        reset({ content: '' })
        onCancel()
    }

    const _onSaveDraft = () => {
        const values = getValues()
        onSaveDraft(values)
    }

    useEffect(() => {
        if (isSubmitSuccessful) {
            reset({ content: '' })
        }
    }, [isSubmitSuccessful, reset])

    return (
        <form className={clsx("space-y-6", !isShow && "opacity-20")} onSubmit={handleSubmit(onSubmit)}>
            <section className="flex items-center justify-end gap-1">
                <button
                    className="btn btn-sm btn-ghost"
                    title="cancel a post"
                    type="button"
                    onClick={_onCancel}
                >
                    取消編輯
                </button>
                <button
                    className="btn btn-sm btn-ghost text-secondary"
                    title="save a draft"
                    type="button"
                    onClick={_onSaveDraft}
                >
                    儲存草稿
                </button>
                <button
                    className="btn btn-sm btn-ghost text-secondary"
                    title="view a draft"
                    type="button"
                    onClick={onFetchDraft}
                >
                    查看草稿
                </button>
                <button
                    className="btn btn-sm btn-secondary"
                    title="submit a post"
                    type="submit"
                    disabled={!isValid || isSubmitting}
                >
                    {isSubmitting ? '發佈中...' : '發佈文章'}
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
                            classes={{
                                content:
                                    'min-h-[3rem] overflow-auto text-white text-xl',
                                placeholder: 'text-gray-300 text-xl',
                            }}
                        />
                    )}
                />
            </section>
        </form>
    )
}
