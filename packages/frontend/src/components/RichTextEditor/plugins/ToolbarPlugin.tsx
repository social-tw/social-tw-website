import {
    Bold,
    Code,
    Italic,
    Link,
    Strikethrough,
    Underline,
} from 'iconoir-react'
import {
    $createParagraphNode,
    $getNodeByKey,
    $getSelection,
    $isRangeSelection,
    FORMAT_TEXT_COMMAND,
    GridSelection,
    LexicalEditor,
    NodeSelection,
    RangeSelection,
    SELECTION_CHANGE_COMMAND,
} from 'lexical'
import {
    ChangeEvent,
    ChangeEventHandler,
    Dispatch,
    RefObject,
    SetStateAction,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react'
import { createPortal } from 'react-dom'
import {
    $createCodeNode,
    $isCodeNode,
    getCodeLanguages,
    getDefaultCodeLanguage,
} from '@lexical/code'
import { $isLinkNode, TOGGLE_LINK_COMMAND } from '@lexical/link'
import {
    $isListNode,
    INSERT_ORDERED_LIST_COMMAND,
    INSERT_UNORDERED_LIST_COMMAND,
    ListNode,
    REMOVE_LIST_COMMAND,
} from '@lexical/list'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import {
    $createHeadingNode,
    $createQuoteNode,
    $isHeadingNode,
} from '@lexical/rich-text'
import { $isAtNodeEnd, $wrapNodes } from '@lexical/selection'
import { $getNearestNodeOfType, mergeRegister } from '@lexical/utils'

const LowPriority = 1

const supportedBlockTypes = new Set()
// const supportedBlockTypes = new Set([
//     'paragraph',
//     'quote',
//     'code',
//     'h1',
//     'h2',
//     'ul',
//     'ol',
// ])

const blockTypeToBlockName = {
    code: 'Code Block',
    h1: 'Large Heading',
    h2: 'Small Heading',
    h3: 'Heading',
    h4: 'Heading',
    h5: 'Heading',
    ol: 'Numbered List',
    paragraph: 'Normal',
    quote: 'Quote',
    ul: 'Bulleted List',
}

function Divider() {
    return <div className="divider" />
}

function positionEditorElement(editor: HTMLDivElement, rect: DOMRect | null) {
    if (rect === null) {
        editor.style.opacity = '0'
        editor.style.top = '-1000px'
        editor.style.left = '-1000px'
    } else {
        editor.style.opacity = '1'
        editor.style.top = `${
            rect.top + rect.height + window.pageYOffset + 10
        }px`
        editor.style.left = `${
            rect.left +
            window.pageXOffset -
            editor.offsetWidth / 2 +
            rect.width / 2
        }px`
    }
}

function FloatingLinkEditor({ editor }: { editor: LexicalEditor }) {
    const editorRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)
    const mouseDownRef = useRef(false)
    const [linkUrl, setLinkUrl] = useState('')
    const [isEditMode, setEditMode] = useState(false)
    const [lastSelection, setLastSelection] = useState<
        RangeSelection | NodeSelection | GridSelection | null
    >(null)

    const updateLinkEditor = useCallback(() => {
        const selection = $getSelection()
        if ($isRangeSelection(selection)) {
            const node = getSelectedNode(selection)
            const parent = node.getParent()
            if ($isLinkNode(parent)) {
                setLinkUrl(parent.getURL())
            } else if ($isLinkNode(node)) {
                setLinkUrl(node.getURL())
            } else {
                setLinkUrl('')
            }
        }
        const editorElem = editorRef.current
        const nativeSelection = window.getSelection()
        const activeElement = document.activeElement

        if (editorElem === null) {
            return
        }

        const rootElement = editor.getRootElement()
        if (
            selection !== null &&
            nativeSelection !== null &&
            !nativeSelection.isCollapsed &&
            rootElement !== null &&
            rootElement.contains(nativeSelection.anchorNode)
        ) {
            const domRange = nativeSelection.getRangeAt(0)
            let rect
            if (nativeSelection.anchorNode === rootElement) {
                let inner: Element | null = rootElement
                while (inner.firstElementChild != null) {
                    inner = inner.firstElementChild
                }
                rect = inner.getBoundingClientRect()
            } else {
                rect = domRange.getBoundingClientRect()
            }

            if (!mouseDownRef.current) {
                positionEditorElement(editorElem, rect)
            }
            setLastSelection(selection)
        } else if (!activeElement || activeElement.className !== 'link-input') {
            positionEditorElement(editorElem, null)
            setLastSelection(null)
            setEditMode(false)
            setLinkUrl('')
        }

        return true
    }, [editor])

    useEffect(() => {
        return mergeRegister(
            editor.registerUpdateListener(({ editorState }) => {
                editorState.read(() => {
                    updateLinkEditor()
                })
            }),

            editor.registerCommand(
                SELECTION_CHANGE_COMMAND,
                () => {
                    updateLinkEditor()
                    return true
                },
                LowPriority,
            ),
        )
    }, [editor, updateLinkEditor])

    useEffect(() => {
        editor.getEditorState().read(() => {
            updateLinkEditor()
        })
    }, [editor, updateLinkEditor])

    useEffect(() => {
        if (isEditMode && inputRef.current) {
            inputRef.current.focus()
        }
    }, [isEditMode])

    return (
        <div ref={editorRef} className="link-editor">
            {isEditMode ? (
                <input
                    ref={inputRef}
                    className="link-input"
                    value={linkUrl}
                    onChange={(event) => {
                        setLinkUrl(event.target.value)
                    }}
                    onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                            event.preventDefault()
                            if (lastSelection !== null) {
                                if (linkUrl !== '') {
                                    editor.dispatchCommand(
                                        TOGGLE_LINK_COMMAND,
                                        linkUrl,
                                    )
                                }
                                setEditMode(false)
                            }
                        } else if (event.key === 'Escape') {
                            event.preventDefault()
                            setEditMode(false)
                        }
                    }}
                />
            ) : (
                <>
                    <div className="link-input">
                        <a
                            href={linkUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {linkUrl}
                        </a>
                        <div
                            className="link-edit"
                            role="button"
                            tabIndex={0}
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={() => {
                                setEditMode(true)
                            }}
                        />
                    </div>
                </>
            )}
        </div>
    )
}

function Select({
    onChange,
    className,
    options,
    value,
}: {
    onChange?: ChangeEventHandler<HTMLSelectElement>
    className?: string
    options?: string[]
    value?: string
}) {
    return (
        <select className={className} onChange={onChange} value={value}>
            <option hidden={true} value="" />
            {options?.map((option) => (
                <option key={option} value={option}>
                    {option}
                </option>
            ))}
        </select>
    )
}

function getSelectedNode(selection: RangeSelection) {
    const anchor = selection.anchor
    const focus = selection.focus
    const anchorNode = selection.anchor.getNode()
    const focusNode = selection.focus.getNode()
    if (anchorNode === focusNode) {
        return anchorNode
    }
    const isBackward = selection.isBackward()
    if (isBackward) {
        return $isAtNodeEnd(focus) ? anchorNode : focusNode
    } else {
        return $isAtNodeEnd(anchor) ? focusNode : anchorNode
    }
}

function BlockOptionsDropdownList({
    editor,
    blockType,
    toolbarRef,
    setShowBlockOptionsDropDown,
}: {
    editor: LexicalEditor
    blockType: string
    toolbarRef: RefObject<HTMLDivElement>
    setShowBlockOptionsDropDown: Dispatch<SetStateAction<boolean>>
}) {
    const dropDownRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const toolbar = toolbarRef.current
        const dropDown = dropDownRef.current

        if (toolbar !== null && dropDown !== null) {
            const { top, left } = toolbar.getBoundingClientRect()
            dropDown.style.top = `${top + 40}px`
            dropDown.style.left = `${left}px`
        }
    }, [dropDownRef, toolbarRef])

    useEffect(() => {
        const dropDown = dropDownRef.current
        const toolbar = toolbarRef.current

        if (dropDown !== null && toolbar !== null) {
            const handle = (event: MouseEvent) => {
                const target = event.target

                if (
                    !dropDown.contains(target as Node) &&
                    !toolbar.contains(target as Node)
                ) {
                    setShowBlockOptionsDropDown(false)
                }
            }
            document.addEventListener('click', handle)

            return () => {
                document.removeEventListener('click', handle)
            }
        }
    }, [dropDownRef, setShowBlockOptionsDropDown, toolbarRef])

    const formatParagraph = () => {
        if (blockType !== 'paragraph') {
            editor.update(() => {
                const selection = $getSelection()

                if ($isRangeSelection(selection)) {
                    $wrapNodes(selection, () => $createParagraphNode())
                }
            })
        }
        setShowBlockOptionsDropDown(false)
    }

    const formatLargeHeading = () => {
        if (blockType !== 'h1') {
            editor.update(() => {
                const selection = $getSelection()

                if ($isRangeSelection(selection)) {
                    $wrapNodes(selection, () => $createHeadingNode('h1'))
                }
            })
        }
        setShowBlockOptionsDropDown(false)
    }

    const formatSmallHeading = () => {
        if (blockType !== 'h2') {
            editor.update(() => {
                const selection = $getSelection()

                if ($isRangeSelection(selection)) {
                    $wrapNodes(selection, () => $createHeadingNode('h2'))
                }
            })
        }
        setShowBlockOptionsDropDown(false)
    }

    const formatBulletList = () => {
        if (blockType !== 'ul') {
            editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)
        } else {
            editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined)
        }
        setShowBlockOptionsDropDown(false)
    }

    const formatNumberedList = () => {
        if (blockType !== 'ol') {
            editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)
        } else {
            editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined)
        }
        setShowBlockOptionsDropDown(false)
    }

    const formatQuote = () => {
        if (blockType !== 'quote') {
            editor.update(() => {
                const selection = $getSelection()

                if ($isRangeSelection(selection)) {
                    $wrapNodes(selection, () => $createQuoteNode())
                }
            })
        }
        setShowBlockOptionsDropDown(false)
    }

    const formatCode = () => {
        if (blockType !== 'code') {
            editor.update(() => {
                const selection = $getSelection()

                if ($isRangeSelection(selection)) {
                    $wrapNodes(selection, () => $createCodeNode())
                }
            })
        }
        setShowBlockOptionsDropDown(false)
    }

    return (
        <div className="flex gap-1" ref={dropDownRef}>
            <button className="item" onClick={formatParagraph}>
                <span className="icon paragraph" />
                <span className="text">Normal</span>
                {blockType === 'paragraph' && <span className="active" />}
            </button>
            <button className="item" onClick={formatLargeHeading}>
                <span className="icon large-heading" />
                <span className="text">Large Heading</span>
                {blockType === 'h1' && <span className="active" />}
            </button>
            <button className="item" onClick={formatSmallHeading}>
                <span className="icon small-heading" />
                <span className="text">Small Heading</span>
                {blockType === 'h2' && <span className="active" />}
            </button>
            <button className="item" onClick={formatBulletList}>
                <span className="icon bullet-list" />
                <span className="text">Bullet List</span>
                {blockType === 'ul' && <span className="active" />}
            </button>
            <button className="item" onClick={formatNumberedList}>
                <span className="icon numbered-list" />
                <span className="text">Numbered List</span>
                {blockType === 'ol' && <span className="active" />}
            </button>
            <button className="item" onClick={formatQuote}>
                <span className="icon quote" />
                <span className="text">Quote</span>
                {blockType === 'quote' && <span className="active" />}
            </button>
            <button className="item" onClick={formatCode}>
                <span className="icon code" />
                <span className="text">Code Block</span>
                {blockType === 'code' && <span className="active" />}
            </button>
        </div>
    )
}

export default function ToolbarPlugin() {
    const [editor] = useLexicalComposerContext()
    const toolbarRef = useRef<HTMLDivElement>(null)
    const [blockType, setBlockType] = useState<string>('paragraph')
    const [selectedElementKey, setSelectedElementKey] = useState<string | null>(
        null,
    )
    const [showBlockOptionsDropDown, setShowBlockOptionsDropDown] =
        useState(false)
    const [codeLanguage, setCodeLanguage] = useState('')
    const [isLink, setIsLink] = useState(false)
    const [isBold, setIsBold] = useState(false)
    const [isItalic, setIsItalic] = useState(false)
    const [isUnderline, setIsUnderline] = useState(false)
    const [isStrikethrough, setIsStrikethrough] = useState(false)
    const [isCode, setIsCode] = useState(false)

    const updateToolbar = useCallback(() => {
        const selection = $getSelection()
        if ($isRangeSelection(selection)) {
            const anchorNode = selection.anchor.getNode()
            const element =
                anchorNode.getKey() === 'root'
                    ? anchorNode
                    : anchorNode.getTopLevelElementOrThrow()
            const elementKey = element.getKey()
            const elementDOM = editor.getElementByKey(elementKey)
            if (elementDOM !== null) {
                setSelectedElementKey(elementKey)
                if ($isListNode(element)) {
                    const parentList = $getNearestNodeOfType(
                        anchorNode,
                        ListNode,
                    )
                    const type = parentList
                        ? parentList.getTag()
                        : element.getTag()
                    setBlockType(type)
                } else {
                    const type = $isHeadingNode(element)
                        ? element.getTag()
                        : element.getType()
                    setBlockType(type)
                    if ($isCodeNode(element)) {
                        setCodeLanguage(
                            element.getLanguage() || getDefaultCodeLanguage(),
                        )
                    }
                }
            }
            // Update text format
            setIsBold(selection.hasFormat('bold'))
            setIsItalic(selection.hasFormat('italic'))
            setIsUnderline(selection.hasFormat('underline'))
            setIsStrikethrough(selection.hasFormat('strikethrough'))
            setIsCode(selection.hasFormat('code'))

            // Update links
            const node = getSelectedNode(selection)
            const parent = node.getParent()
            if ($isLinkNode(parent) || $isLinkNode(node)) {
                setIsLink(true)
            } else {
                setIsLink(false)
            }
        }
    }, [editor])

    useEffect(() => {
        return mergeRegister(
            editor.registerUpdateListener(({ editorState }) => {
                editorState.read(() => {
                    updateToolbar()
                })
            }),
            editor.registerCommand(
                SELECTION_CHANGE_COMMAND,
                (_payload, newEditor) => {
                    updateToolbar()
                    return false
                },
                LowPriority,
            ),
        )
    }, [editor, updateToolbar])

    const codeLanguges = useMemo(() => getCodeLanguages(), [])
    const onCodeLanguageSelect = useCallback(
        (e: ChangeEvent<HTMLSelectElement>) => {
            editor.update(() => {
                if (selectedElementKey !== null) {
                    const node = $getNodeByKey(selectedElementKey)
                    if ($isCodeNode(node)) {
                        node.setLanguage(e.target.value)
                    }
                }
            })
        },
        [editor, selectedElementKey],
    )

    const insertLink = useCallback(() => {
        if (!isLink) {
            editor.dispatchCommand(TOGGLE_LINK_COMMAND, 'https://')
        } else {
            editor.dispatchCommand(TOGGLE_LINK_COMMAND, null)
        }
    }, [editor, isLink])

    return (
        <div className="flex gap-1 p-1" ref={toolbarRef}>
            {supportedBlockTypes.has(blockType) && (
                <>
                    <button
                        className="btn btn-sm btn-square btn-ghost block-controls"
                        onClick={() =>
                            setShowBlockOptionsDropDown(
                                !showBlockOptionsDropDown,
                            )
                        }
                        aria-label="Formatting Options"
                    >
                        <span className={'icon block-type ' + blockType} />
                        <span className="text">
                            {
                                blockTypeToBlockName[
                                    blockType as keyof typeof blockTypeToBlockName
                                ]
                            }
                        </span>
                        <i className="chevron-down" />
                    </button>
                    {showBlockOptionsDropDown &&
                        createPortal(
                            <BlockOptionsDropdownList
                                editor={editor}
                                blockType={blockType}
                                toolbarRef={toolbarRef}
                                setShowBlockOptionsDropDown={
                                    setShowBlockOptionsDropDown
                                }
                            />,
                            document.body,
                        )}
                </>
            )}
            {blockType === 'code' ? (
                <>
                    <Select
                        className="btn btn-sm btn-square btn-ghost code-language"
                        onChange={onCodeLanguageSelect}
                        options={codeLanguges}
                        value={codeLanguage}
                    />
                    <i className="chevron-down inside" />
                </>
            ) : (
                <>
                    <button
                        onClick={() => {
                            editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')
                        }}
                        className={
                            'btn btn-sm btn-square btn-ghost spaced ' +
                            (isBold ? 'active' : '')
                        }
                        aria-label="Format Bold"
                    >
                        <Bold />
                    </button>
                    <button
                        onClick={() => {
                            editor.dispatchCommand(
                                FORMAT_TEXT_COMMAND,
                                'italic',
                            )
                        }}
                        className={
                            'btn btn-sm btn-square btn-ghost spaced ' +
                            (isItalic ? 'active' : '')
                        }
                        aria-label="Format Italics"
                    >
                        <Italic />
                    </button>
                    <button
                        onClick={() => {
                            editor.dispatchCommand(
                                FORMAT_TEXT_COMMAND,
                                'underline',
                            )
                        }}
                        className={
                            'btn btn-sm btn-square btn-ghost spaced ' +
                            (isUnderline ? 'active' : '')
                        }
                        aria-label="Format Underline"
                    >
                        <Underline />
                    </button>
                    <button
                        onClick={() => {
                            editor.dispatchCommand(
                                FORMAT_TEXT_COMMAND,
                                'strikethrough',
                            )
                        }}
                        className={
                            'btn btn-sm btn-square btn-ghost spaced ' +
                            (isStrikethrough ? 'active' : '')
                        }
                        aria-label="Format Strikethrough"
                    >
                        <Strikethrough />
                    </button>
                    <button
                        onClick={() => {
                            editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'code')
                        }}
                        className={
                            'btn btn-sm btn-square btn-ghost spaced ' +
                            (isCode ? 'active' : '')
                        }
                        aria-label="Insert Code"
                    >
                        <Code />
                    </button>
                    <button
                        onClick={insertLink}
                        className={
                            'btn btn-sm btn-square btn-ghost spaced ' +
                            (isLink ? 'active' : '')
                        }
                        aria-label="Insert Link"
                    >
                        <Link />
                    </button>
                    {isLink &&
                        createPortal(
                            <FloatingLinkEditor editor={editor} />,
                            document.body,
                        )}
                </>
            )}
        </div>
    )
}
