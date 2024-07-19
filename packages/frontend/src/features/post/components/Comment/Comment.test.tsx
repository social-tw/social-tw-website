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

    it('calls republish function on republish button click', async () => {
        render(
            <Comment {...mockCommentInfo} status={CommentStatus.Failure} />,
            { wrapper },
        )

        const republishButton = screen.getByText(/再次發佈這則留言/i)
        await userEvent.click(republishButton)
    })
})
