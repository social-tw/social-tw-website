import clsx from 'clsx'
import { EditorState } from 'lexical'
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
    placeholder = '你想說些什麼呢......？',
    value,
    onValueChange,
    onError,
}: {
    namespace?: string
    classes?: {
        root?: string
        content?: string
        placeholder?: string
    }
    placeholder?: string
    value?: string
    onValueChange?: (md: string) => void
    onError?: (error: Error) => void
}) {
    const _editorState = () => $convertFromMarkdownString(value ?? '')

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
        <div className={classes?.root}>
            <LexicalComposer initialConfig={initialConfig}>
                {/* <ToolbarPlugin /> */}
                <div className="relative">
                    <RichTextPlugin
                        contentEditable={
                            <div className={classes?.content}>
                                <ContentEditable className="focus-visible:outline-none" />
                            </div>
                        }
                        placeholder={
                            <div
                                className={clsx(
                                    'absolute top-0 -z-10',
                                    classes?.placeholder
                                )}
                            >
                                {placeholder}
                            </div>
                        }
                        ErrorBoundary={LexicalErrorBoundary}
                    />
                    <MarkdownShortcutPlugin />
                    <OnChangePlugin onChange={_onChange} />
                    <AutoFocusPlugin />
                    <HistoryPlugin />
                    <ClearEditorPlugin />
                    <ClearAllPlugin value={value} />
                </div>
            </LexicalComposer>
        </div>
    )
}
