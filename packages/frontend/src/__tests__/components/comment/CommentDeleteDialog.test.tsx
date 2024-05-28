import CommentDeleteDialog from '@/components/comment/CommentDeleteDialog'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

describe('CommentDeleteDialog', () => {
    it('renders when open is true', () => {
        render(<CommentDeleteDialog open={true} />)
        expect(screen.getByText(/確定要刪除這則留言嗎？/)).toBeInTheDocument()
    })

    it('does not render when open is false', () => {
        render(<CommentDeleteDialog open={false} />)
        expect(screen.queryByText(/確定要刪除這則留言嗎？/)).toBeNull()
    })

    it('calls onClose when the dialog is closed', async () => {
        const onCloseMock = jest.fn()
        render(<CommentDeleteDialog open={true} onClose={onCloseMock} />)

        await userEvent.click(screen.getByLabelText('close'))

        expect(onCloseMock).toHaveBeenCalled()
    })

    it('calls onConfirm when the confirm button is clicked', async () => {
        const onConfirmMock = jest.fn()
        render(<CommentDeleteDialog open={true} onConfirm={onConfirmMock} />)

        await userEvent.click(screen.getByText(/確認刪除/))

        expect(onConfirmMock).toHaveBeenCalled()
    })
})
