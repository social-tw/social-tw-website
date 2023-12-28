import { Klass, LexicalNode } from 'lexical'
import { CodeHighlightNode, CodeNode } from '@lexical/code'
import { HashtagNode } from '@lexical/hashtag'
import { AutoLinkNode, LinkNode } from '@lexical/link'
import { ListItemNode, ListNode } from '@lexical/list'
import { MarkNode } from '@lexical/mark'
import { OverflowNode } from '@lexical/overflow'
import { HorizontalRuleNode } from '@lexical/react/LexicalHorizontalRuleNode'
import { HeadingNode, QuoteNode } from '@lexical/rich-text'
import { TableCellNode, TableNode, TableRowNode } from '@lexical/table'
import { EmojiNode } from './EmojiNode'
import { ImageNode } from './ImageNode'

const Nodes: Array<Klass<LexicalNode>> = [
    AutoLinkNode,
    CodeHighlightNode,
    CodeNode,
    EmojiNode,
    HashtagNode,
    HeadingNode,
    HorizontalRuleNode,
    ImageNode,
    LinkNode,
    ListItemNode,
    ListNode,
    MarkNode,
    OverflowNode,
    QuoteNode,
    TableCellNode,
    TableNode,
    TableRowNode,
]

export default Nodes
