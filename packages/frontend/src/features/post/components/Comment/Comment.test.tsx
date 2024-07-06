import { CommentStatus } from '@/types/Comments'
import { wrapper } from '@/utils/test-helpers/wrapper'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Comment from './Comment'

jest.mock('@uidotdev/usehooks', () => {
    const original = jest.requireActual('@uidotdev/usehooks')
    return {
        ...original,
        useMediaQuery: jest.fn().mockReturnValue(false),
    }
})

describe('Comment', () => {
    const mockCommentInfo = {
        commentId: 'comment-1',
        postId: 'post-1',
        epoch: 1,
        epochKey: 'epochKey-1',
        content: 'Test comment content',
        transactionHash: 'hash-1',
        publishedAt: new Date(),
        status: CommentStatus.Success,
        canDelete: true,
        canReport: true,
    }

    it('renders successfully', async () => {
        render(<Comment {...mockCommentInfo} />, { wrapper })

        await waitFor(() => {
            expect(
                screen.getByText(mockCommentInfo.content),
            ).toBeInTheDocument()
        })
    })

    it('opens report dialog on report action', async () => {
        render(<Comment {...mockCommentInfo} />, { wrapper })

        const user = userEvent.setup()
        await user.click(screen.getByTestId('action-btn'))
        await user.click(screen.getByText(/檢舉留言/i))

        expect(screen.getByText(/確認檢舉/i)).toBeInTheDocument()
    })

    it('opens delete dialog and calls onDelete function', async () => {
        render(<Comment {...mockCommentInfo} />, { wrapper })

        const user = userEvent.setup()
        await user.click(screen.getByTestId('action-btn'))
        await user.click(screen.getByText(/刪除留言/i))
        await user.click(screen.getByText(/確認刪除/i))
    })

    it('calls republish function on republish button click', async () => {
        render(
            <Comment {...mockCommentInfo} status={CommentStatus.Failure} />,
            { wrapper },
        )

        const republishButton = screen.getByText(/再次發佈這則留言/i)
        await userEvent.click(republishButton)
    })
})
