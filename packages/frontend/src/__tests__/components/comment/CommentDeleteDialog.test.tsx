import { render, fireEvent, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import CommentDeleteDialog from '@/components/comment/CommentDeleteDialog'

describe('CommentDeleteDialog', () => {
    it('renders when open is true', () => {
        render(<CommentDeleteDialog open={true} commentId="123" />)
        expect(screen.getByText(/確定要刪除這則留言嗎？/)).toBeInTheDocument()
    })

    it('does not render when open is false', () => {
        render(<CommentDeleteDialog open={false} commentId="123" />)
        expect(screen.queryByText(/確定要刪除這則留言嗎？/)).toBeNull()
    })

    it('calls onClose when the dialog is closed', () => {
        const onCloseMock = jest.fn()
        render(
            <CommentDeleteDialog
                open={true}
                onClose={onCloseMock}
                commentId="123"
            />
        )

        fireEvent.click(screen.getByLabelText('close'))
        expect(onCloseMock).toHaveBeenCalled()
    })

    it('calls onConfirm when the confirm button is clicked', () => {
        const onConfirmMock = jest.fn()
        render(
            <CommentDeleteDialog
                open={true}
                onConfirm={onConfirmMock}
                commentId="123"
            />
        )

        fireEvent.click(screen.getByText(/確認刪除/))
        expect(onConfirmMock).toHaveBeenCalled()
    })
})
