import { CLEAR_EDITOR_COMMAND } from 'lexical'
import { useEffect } from 'react'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { useIsFirstRender } from '@uidotdev/usehooks'

export default function ClearAllPlugin({
    value,
}: {
    value?: string
}): JSX.Element | null {
    const isFirstRender = useIsFirstRender()
    const [editor] = useLexicalComposerContext()
    useEffect(() => {
        if (!value && !isFirstRender) {
            editor.dispatchCommand(CLEAR_EDITOR_COMMAND, undefined)
            editor.focus()
        }
    }, [value, isFirstRender, editor])
    return null
}
