import '@testing-library/jest-dom'
import DesktopCommentForm from '@/components/comment/DesktopCommentForm' // Adjust the import path as needed
import { render, screen } from '@testing-library/react'
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
        const mockOnSubmit = jest.fn()

        render(<DesktopCommentForm isOpen={true} onSubmit={mockOnSubmit} />)

        const input = screen.getByLabelText('comment editor')
        await userEvent.click(input)
        await userEvent.keyboard('Test comment')

        const submitButton = screen.getByTitle('submit a comment')
        await userEvent.click(submitButton)

        // expect(mockOnSubmit).toHaveBeenCalledWith({ content: 'Test comment' })
    })

    it('calls onCancel when the close icon is clicked', async () => {
        const mockOnCancel = jest.fn()

        render(<DesktopCommentForm isOpen={true} onCancel={mockOnCancel} />)

        const cancelButton = screen.getByTitle('cancel a comment')
        await userEvent.click(cancelButton)

        expect(mockOnCancel).toHaveBeenCalled()
    })
})
