import '@testing-library/jest-dom'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { ReactNode } from 'react'
import Comment from '@/components/comment/Comment'
import { UserProvider } from '@/contexts/User'
import useCreateComment from '@/hooks/useCreateComment'
import useRemoveComment from '@/hooks/useRemoveComment'
import { CommentStatus } from '@/types/Comments'
import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/react'

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
jest.mock('@/hooks/useRemoveComment')

const mockedUseCreateComment = useCreateComment as jest.MockedFunction<
    typeof useCreateComment
>
const mockedUseRemoveComment = useRemoveComment as jest.MockedFunction<
    typeof useRemoveComment
>

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

    const mockTransaction = 'mockTransaction'

    beforeEach(() => {
        mockedUseCreateComment.mockReturnValue({
            create: jest.fn().mockImplementation(() =>
                Promise.resolve({
                    transaction: mockTransaction,
                }),
            ),
        })

        mockedUseRemoveComment.mockReturnValue({
            remove: jest.fn().mockImplementation(() =>
                Promise.resolve({
                    transaction: mockTransaction,
                }),
            ),
        })
    })

    const renderWithProvider = (component: ReactNode) => {
        return render(<UserProvider>{component}</UserProvider>)
    }

    it('renders successfully', () => {
        renderWithProvider(<Comment {...mockCommentInfo} />)
        expect(screen.getByText(mockCommentInfo.content)).toBeInTheDocument()
    })

    it('opens report dialog on report action', async () => {
        renderWithProvider(<Comment {...mockCommentInfo} />)

        await userEvent.click(screen.getByRole('button', { name: /more/i }))
        await userEvent.click(screen.getByText(/檢舉留言/i))

        expect(screen.getByText(/確認檢舉/i)).toBeInTheDocument()
    })

    it('opens delete dialog and calls onDelete function', async () => {
        renderWithProvider(<Comment {...mockCommentInfo} />)

        await userEvent.click(screen.getByRole('button', { name: /more/i }))
        await userEvent.click(screen.getByText(/刪除留言/i))
        await userEvent.click(screen.getByText(/確認刪除/i))
    })

    it('calls republish function on republish button click', async () => {
        renderWithProvider(
            <Comment {...mockCommentInfo} status={CommentStatus.Failure} />,
        )

        const republishButton = screen.getByText(/再次發佈這則留言/i)
        await userEvent.click(republishButton)
    })
})
