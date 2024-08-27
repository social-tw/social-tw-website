import {
    ActionStatus,
    ActionType,
    removeAction,
    useActionStore,
} from '@/features/core'
import { useReputationScore } from '@/features/reporting'
import { RichTextEditor } from '@/features/shared'
import { openForbidActionDialog } from '@/features/shared/stores/dialog'
import { clsx } from 'clsx'
import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useSearchParams } from 'react-router-dom'

export interface PostFormValues {
    content: string
}

export default function PostForm({
    onCancel = () => {},
    onSubmit = () => {},
    disabled = false,
}: {
    onCancel?: () => void
    onSubmit?: (values: PostFormValues) => void
    disabled?: boolean
}) {
    const [searchParams, setSearchParams] = useSearchParams()
    const failedPostId = searchParams.get('failedPostId')
    const actions = useActionStore((state) => state.entities)

    const { handleSubmit, control, reset, setValue } = useForm<PostFormValues>({
        defaultValues: {
            content: '',
        },
    })
    useEffect(() => {
        if (failedPostId) {
            const failedPost = Object.values(actions).find(
                (action) =>
                    action.type === ActionType.Post &&
                    action.status === ActionStatus.Failure &&
                    action.id === failedPostId,
            )
            if (!!failedPost?.data && 'content' in failedPost.data) {
                setValue('content', failedPost.data.content)
            }
        }
    }, [failedPostId, actions, setValue])

    const { isValidReputationScore } = useReputationScore()
    const _onSubmit = handleSubmit(async (values) => {
        const cache = { ...values }
        if (!isValidReputationScore) {
            openForbidActionDialog()
            return
        }
        try {
            onSubmit(cache)
            reset({ content: '' })
            if (failedPostId) {
                removeAction(failedPostId)
                setSearchParams({}, { replace: true })
            }
        } catch (error) {
            console.error('Failed to submit post:', error)
        }
    })

    const _onCancel = () => {
        reset({ content: '' })
        if (failedPostId) {
            setSearchParams({}, { replace: true })
        }
        onCancel()
    }

    const handleClearFailedPost = () => {
        if (failedPostId) {
            removeAction(failedPostId)
            setSearchParams({}, { replace: true })
        }
    }

    return (
        <>
            <form
                className={clsx('space-y-6', disabled && 'opacity-20')}
                onSubmit={_onSubmit}
            >
                <section className="flex items-center justify-end gap-1">
                    <button
                        className="text-white btn btn-sm btn-ghost"
                        title="cancel a post"
                        type="button"
                        disabled={disabled}
                        onClick={_onCancel}
                    >
                        取消編輯
                    </button>
                    <button
                        className="text-white btn btn-sm btn-secondary"
                        title="submit a post"
                        type="submit"
                    >
                        發佈文章
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
                                placeholder="你想說些什麼呢......？"
                                classes={{
                                    content:
                                        'min-h-[3rem] overflow-auto text-white text-xl tracking-wide',
                                    placeholder: 'text-gray-300 text-xl',
                                }}
                                onClearFailedPost={handleClearFailedPost}
                            />
                        )}
                    />
                </section>
            </form>
        </>
    )
}
