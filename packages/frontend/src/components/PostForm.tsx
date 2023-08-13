import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import RichTextEditor from './RichTextEditor'

export interface PostValues {
    content: string
}

export default function PostForm({
    onCancel = () => {},
    onSaveDraft = () => {},
    onFetchDraft = () => {},
    onSubmit = () => {},
}: {
    onCancel?: () => void
    onSaveDraft?: (values: PostValues) => void
    onFetchDraft?: () => void
    onSubmit?: (values: PostValues) => void
}) {
    const { handleSubmit, control, reset, getValues, formState } =
        useForm<PostValues>({
            defaultValues: {
                content: '',
            },
        })

    const { isSubmitting, isSubmitSuccessful } = formState

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
        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <section className="flex items-center justify-end gap-1">
                <button
                    className="btn btn-sm btn-ghost"
                    type="button"
                    onClick={_onCancel}
                >
                    取消編輯
                </button>
                <button
                    className="btn btn-sm btn-ghost text-secondary"
                    type="button"
                    onClick={_onSaveDraft}
                >
                    儲存草稿
                </button>
                <button
                    className="btn btn-sm btn-ghost text-secondary"
                    type="button"
                    onClick={onFetchDraft}
                >
                    查看草稿
                </button>
                <button
                    className="btn btn-sm btn-secondary"
                    type="submit"
                    disabled={isSubmitting}
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
