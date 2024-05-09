import '@testing-library/jest-dom'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { ReactNode } from 'react'
import Comment from '@/components/comment/Comment'
import { removeActionByCommentId } from '@/contexts/Actions'
import { UserProvider } from '@/contexts/User'
import useCreateComment from '@/hooks/useCreateComment'
import useDeleteComment from '@/hooks/useDeleteComment'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { CommentStatus } from '@/types/Comments'

dayjs.extend(relativeTime)

jest.mock('@uidotdev/usehooks', () => ({
    useMediaQuery: jest.fn().mockReturnValue(false),
}))

jest.mock('@/contexts/Actions', () => ({
    ...jest.requireActual<typeof import('@/contexts/Actions')>(
        '@/contexts/Actions',
    ), // This imports all the actual other exports
    removeActionByCommentId: jest.fn(), // This provides your mock implementation
}))

jest.mock('@/hooks/useCreateComment')
jest.mock('@/hooks/useDeleteComment')

const mockedUseCreateComment = useCreateComment as jest.MockedFunction<
    typeof useCreateComment
>
const mockedUseDeleteComment = useDeleteComment as jest.MockedFunction<
    typeof useDeleteComment
>

describe('Comment', () => {
    const mockCommentInfo = {
        commentId: 'comment-1',
        postId: 'post-1',
        epoch: 1,
        epochKey: 'epochKey-1',
        content: 'Test comment content',
        transactionHash: 'hash-1',
        publishedAt: Date.now(),
        status: CommentStatus.Success,
        isMine: true,
    }

    const mockProof = 'mockProof'
    const mockEpoch = 1
    const mockTransaction = 'mockTransaction'

    beforeEach(() => {
        mockedUseCreateComment.mockReturnValue({
            genProof: jest.fn().mockImplementation(() =>
                Promise.resolve({
                    proof: mockProof,
                    epoch: mockEpoch,
                }),
            ),
            create: jest.fn().mockImplementation(() =>
                Promise.resolve({
                    transaction: mockTransaction,
                }),
            ),
        })

        mockedUseDeleteComment.mockReturnValue({
            genProof: jest.fn().mockImplementation(() =>
                Promise.resolve({
                    proof: mockProof,
                    epoch: mockEpoch,
                }),
            ),
            remove: jest.fn().mockImplementation(() =>
                Promise.resolve({
                    transaction: mockTransaction,
                }),
            ),
            isDeleted: false,
        })
    })

    const renderWithProvider = (component: ReactNode) => {
        return render(<UserProvider>{component}</UserProvider>)
    }

    it('renders successfully', () => {
        renderWithProvider(<Comment {...mockCommentInfo} />)
        expect(screen.getByText(mockCommentInfo.content)).toBeInTheDocument()
    })

    it('opens report dialog on report action', () => {
        renderWithProvider(
            <Comment {...{ ...mockCommentInfo, isMine: false }} />,
        )
        fireEvent.click(screen.getByRole('button', { name: /more/i }))
        fireEvent.click(screen.getByText(/檢舉留言/i))
        expect(screen.getByText(/確認檢舉/i)).toBeInTheDocument()
    })

    it('opens delete dialog and calls onDelete function', async () => {
        const mockOnOpenAnimation = jest.fn()
        const mockOnCloseAnimation = jest.fn()

        renderWithProvider(
            <Comment
                {...{
                    ...mockCommentInfo,
                    onOpenAnimation: mockOnOpenAnimation,
                    onCloseAnimation: mockOnCloseAnimation,
                }}
            />,
        )
        fireEvent.click(screen.getByRole('button', { name: /more/i }))
        fireEvent.click(screen.getByText(/刪除留言/i))
        fireEvent.click(screen.getByText(/確認刪除/i))

        await act(async () => {
            expect(mockOnOpenAnimation).toHaveBeenCalled()
            expect(mockOnOpenAnimation).toHaveBeenCalled()
        })
    })

    it('calls republish function on republish button click', async () => {
        const mockOnOpenAnimation = jest.fn()
        const mockOnCloseAnimation = jest.fn()

        renderWithProvider(
            <Comment
                {...{
                    ...mockCommentInfo,
                    status: CommentStatus.Failure,
                    onOpenAnimation: mockOnOpenAnimation,
                    onCloseAnimation: mockOnCloseAnimation,
                }}
            />,
        )

        const republishButton = screen.getByText(/再次發佈這則留言/i)
        fireEvent.click(republishButton)

        await act(async () => {
            expect(removeActionByCommentId).toHaveBeenCalledWith(
                mockCommentInfo.commentId,
            )
            expect(mockOnOpenAnimation).toHaveBeenCalled()
            expect(mockOnOpenAnimation).toHaveBeenCalled()
        })
    })
})
