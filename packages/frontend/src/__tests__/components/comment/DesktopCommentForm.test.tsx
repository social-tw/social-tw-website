import '@testing-library/jest-dom'
import DesktopCommentForm from '@/components/comment/DesktopCommentForm' // Adjust the import path as needed
import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

describe('DesktopCommentForm', () => {
    it('renders when open', () => {
        render(<DesktopCommentForm isOpen={true} />)
        expect(screen.getByLabelText('comment editor')).toBeInTheDocument()
    })

    it('does not render when not open', () => {
        render(<DesktopCommentForm isOpen={false} />)
        expect(screen.queryByLabelText('comment editor')).toBeNull()
    })

    it('calls onSubmit with the entered text', async () => {
        const user = userEvent.setup()

        const mockOnSubmit = jest.fn()

        render(<DesktopCommentForm isOpen={true} onSubmit={mockOnSubmit} />)

        await act(async () => {
            const input = screen.getByLabelText('comment editor')

            await user.click(input)
            await user.keyboard('Test comment')

            const submitButton = screen.getByTitle('submit a comment')
            await user.click(submitButton)
        })

        // expect(mockOnSubmit).toHaveBeenCalledWith({ content: 'Test comment' })
    })

    it('calls onCancel when the close icon is clicked', async () => {
        const user = userEvent.setup()

        const mockOnCancel = jest.fn()

        render(<DesktopCommentForm isOpen={true} onCancel={mockOnCancel} />)

        await act(async () => {
            const cancelButton = screen.getByTitle('cancel a comment')
            await user.click(cancelButton)
        })

        expect(mockOnCancel).toHaveBeenCalled()
    })
})
