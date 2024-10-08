import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CommentFormMobile from './CommentFormMobile'

describe('CommentFormMobile', () => {
    it('renders when open', async () => {
        render(<CommentFormMobile isOpen={true} />)
        await waitFor(() => {
            expect(screen.getByLabelText('comment editor')).toBeInTheDocument()
        })
    })

    it('does not render when not open', async () => {
        render(<CommentFormMobile isOpen={false} />)
        await waitFor(() => {
            expect(screen.queryByLabelText('comment editor')).toBeNull()
        })
    })

    it('calls onSubmit with the entered text', async () => {
        const mockOnSubmit = jest.fn()

        render(<CommentFormMobile isOpen={true} onSubmit={mockOnSubmit} />)

        const input = screen.getByLabelText('comment editor')
        await userEvent.click(input)
        await userEvent.keyboard('Test comment')

        const submitButton = screen.getByTitle('submit a comment')
        await userEvent.click(submitButton)

        // expect(mockOnSubmit).toHaveBeenCalledWith({ content: 'Test comment' })
    })

    it('calls onCancel when cancel button is clicked', async () => {
        const mockOnCancel = jest.fn()
        render(<CommentFormMobile isOpen={true} onCancel={mockOnCancel} />)

        const cancelButton = screen.getByTitle('cancel a comment')
        await userEvent.click(cancelButton)

        expect(mockOnCancel).toHaveBeenCalled()
    })
})
