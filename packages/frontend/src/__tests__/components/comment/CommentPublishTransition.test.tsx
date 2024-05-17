import { render, screen } from '@testing-library/react'
import CommentPublishTransition from '@/components/comment/CommentPublishTransition'

describe('CommentPublishTransition', () => {
    it('renders when open', () => {
        render(<CommentPublishTransition isOpen={true} />)

        expect(screen.getByAltText('Comment')).toBeInTheDocument()
        expect(screen.getByText('您的留言正在處理中，')).toBeInTheDocument()
        expect(screen.getByText('請留意資訊並確認存取狀態')).toBeInTheDocument()

        const dots = screen.getAllByLabelText('dot')
        expect(dots.length).toBe(3)
    })

    it('does not render when closed', () => {
        render(<CommentPublishTransition isOpen={false} />)

        expect(screen.queryByAltText('Comment')).not.toBeInTheDocument()
        expect(
            screen.queryByText('您的留言正在處理中，'),
        ).not.toBeInTheDocument()
        expect(
            screen.queryByText('請留意資訊並確認存取狀態'),
        ).not.toBeInTheDocument()
    })
})
