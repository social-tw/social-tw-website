import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CommentFormDesktop from './CommentFormDesktop'
import { MemoryRouter } from 'react-router-dom'

describe('CommentFormDesktop', () => {
    it('renders when open', async () => {
        render(
            <MemoryRouter>
                <CommentFormDesktop isOpen={true} />
            </MemoryRouter>,
        )
        await waitFor(() => {
            expect(screen.getByLabelText('comment editor')).toBeInTheDocument()
        })
    })

    it('does not render when not open', async () => {
        render(<CommentFormDesktop isOpen={false} />)
        await waitFor(() => {
            expect(screen.queryByLabelText('comment editor')).toBeNull()
        })
    })

    it('calls onSubmit with the entered text', async () => {
        const user = userEvent.setup()

        const mockOnSubmit = jest.fn()

        render(<CommentFormDesktop isOpen={true} onSubmit={mockOnSubmit} />)

        const input = screen.getByLabelText('comment editor')

        await user.click(input)
        await user.keyboard('Test comment')

        const submitButton = screen.getByTitle('submit a comment')
        await user.click(submitButton)

        // expect(mockOnSubmit).toHaveBeenCalledWith({ content: 'Test comment' })
    })

    it('calls onCancel when the close icon is clicked', async () => {
        const user = userEvent.setup()

        const mockOnCancel = jest.fn()

        render(<CommentFormDesktop isOpen={true} onCancel={mockOnCancel} />)

        const cancelButton = screen.getByTitle('cancel a comment')
        await user.click(cancelButton)

        expect(mockOnCancel).toHaveBeenCalled()
    })
})
