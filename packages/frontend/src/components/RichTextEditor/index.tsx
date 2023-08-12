import { EditorState } from 'lexical'
import {
    $convertFromMarkdownString,
    $convertToMarkdownString,
} from '@lexical/markdown'
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin'
import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin'
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import nodes from './nodes'
import ToolbarPlugin from './plugins/ToolbarPlugin'

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
    value,
    onValueChange,
    onError,
}: {
    namespace?: string
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
        <div className="bg-base-100 rounded-lg" data-theme="light">
            <LexicalComposer initialConfig={initialConfig}>
                <ToolbarPlugin />
                <div className="relative">
                    <RichTextPlugin
                        contentEditable={
                            <div className="min-h-[10rem] overflow-auto p-4">
                                <ContentEditable className="focus-visible:outline-none" />
                            </div>
                        }
                        placeholder={
                            <div className="absolute left-4 top-4 -z-10 text-gray-300">
                                說說你的想法吧～
                            </div>
                        }
                        ErrorBoundary={LexicalErrorBoundary}
                    />
                    <MarkdownShortcutPlugin />
                    <OnChangePlugin onChange={_onChange} />
                    <AutoFocusPlugin />
                    <HistoryPlugin />
                </div>
            </LexicalComposer>
        </div>
    )
}
