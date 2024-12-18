import { ActionStatus, ActionType, useActionStore } from '@/features/core'
import {
    $convertFromMarkdownString,
    $convertToMarkdownString,
} from '@lexical/markdown'
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin'
import { ClearEditorPlugin } from '@lexical/react/LexicalClearEditorPlugin'
import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin'
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import clsx from 'clsx'
import { EditorState } from 'lexical'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import nodes from './nodes'
import ClearAllPlugin from './plugins/ClearAllPlugin'

const theme = {
    text: {
        bold: 'rt-text-bold',
        italic: 'rt-text-italic',
        underline: 'underline',
        strikethrough: 'line-through',
        underlineStrikethrough: 'underline line-through',
        code: 'rt-text-code',
    },
}

export default function RichTextEditor({
    namespace = 'RichTextEditor',
    classes,
    ariaLabel = '',
    placeholder = '你想說些什麼呢......？',
    value,
    onValueChange,
    onError,
    failedPostContent,
    onFailedPostClear,
    onClearFailedPost,
}: {
    namespace?: string
    classes?: {
        root?: string
        content?: string
        placeholder?: string
    }
    ariaLabel?: string
    placeholder?: string
    value?: string
    onValueChange?: (md: string) => void
    onError?: (error: Error) => void
    failedPostContent?: string
    onFailedPostClear?: () => void
    onClearFailedPost?: () => void
}) {
    let searchParams: URLSearchParams | null = null
    try {
        [searchParams] = useSearchParams()
    } catch (e) {
        console.warn('RichTextEditor is not within a Router context')
    }
    const failedPostId = searchParams?.get('failedPostId') || null
    const [localFailedPostContent, setLocalFailedPostContent] = useState<
        string | undefined
    >(undefined)
    const actions = useActionStore((state) => state.entities)

    useEffect(() => {
        if (failedPostId) {
            const failedPost = Object.values(actions).find(
                (action) =>
                    action.type === ActionType.Post &&
                    action.status === ActionStatus.Failure &&
                    action.id === failedPostId,
            )
            if (!!failedPost?.data && 'content' in failedPost.data) {
                setLocalFailedPostContent(failedPost.data.content)
            }
        }
    }, [failedPostId, actions])

    useEffect(() => {
        if (localFailedPostContent) {
            onValueChange?.(localFailedPostContent)
        }
    }, [localFailedPostContent, onValueChange])

    useEffect(() => {
        return () => {
            if (localFailedPostContent && onClearFailedPost) {
                onClearFailedPost()
            }
        }
    }, [localFailedPostContent, onClearFailedPost])

    const _editorState = () => {
        const content = localFailedPostContent ?? value ?? ''
        return $convertFromMarkdownString(content)
    }

    const _onChange = (editorState: EditorState) => {
        editorState.read(() => {
            const markdown = $convertToMarkdownString()
            if (onValueChange) {
                onValueChange(markdown)
            }
        })
    }

    const _onError = (e: Error) => {
        if (onError) {
            onError(e)
        }
    }

    const initialConfig = {
        namespace,
        theme,
        nodes,
        editorState: _editorState,
        onError: _onError,
    }

    return (
        <div className={classes?.root} tabIndex={-1}>
            <LexicalComposer
                initialConfig={initialConfig}
                key={localFailedPostContent}
            >
                {/* <ToolbarPlugin /> */}
                <div className="relative">
                    <RichTextPlugin
                        contentEditable={
                            <div className={classes?.content}>
                                <ContentEditable
                                    ariaLabel={ariaLabel}
                                    className="focus-visible:outline-none"
                                />
                            </div>
                        }
                        placeholder={
                            <div
                                className={clsx(
                                    'absolute top-0 -z-10',
                                    classes?.placeholder,
                                )}
                            >
                                {placeholder}
                            </div>
                        }
                        ErrorBoundary={LexicalErrorBoundary}
                    />
                    <MarkdownShortcutPlugin />
                    <OnChangePlugin onChange={_onChange} />
                    {/* <AutoFocusPlugin /> */}
                    <HistoryPlugin />
                    <ClearEditorPlugin />
                    <ClearAllPlugin
                        value={value}
                        onClear={() => {
                            onValueChange?.('')
                            setLocalFailedPostContent(undefined)
                            onFailedPostClear?.()
                        }}
                    />
                </div>
            </LexicalComposer>
        </div>
    )
}
