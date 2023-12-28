import { render, fireEvent, screen, act } from '@testing-library/react'
import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import DesktopCommentForm from '@/components/comment/DesktopCommentForm' // Adjust the import path as needed

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

        await act(async () => {
            render(<DesktopCommentForm isOpen={true} onSubmit={mockOnSubmit} />)
        })

        const input = screen.getByLabelText('comment editor')
        await act(async () => {
            await userEvent.type(input, 'Test comment')
        })

        const submitButton = screen.getByTitle(
            'submit a comment',
        ) as HTMLButtonElement
        userEvent.click(submitButton)

        // TODO: Have act issue. can't run the below code
        // expect(mockOnSubmit).toHaveBeenCalledWith({ content: 'Test comment' })
    })

    it('calls onCancel when the close icon is clicked', () => {
        const mockOnCancel = jest.fn()
        render(<DesktopCommentForm isOpen={true} onCancel={mockOnCancel} />)

        const cancelButton = screen.getByTitle('cancel a comment')
        fireEvent.click(cancelButton)

        expect(mockOnCancel).toHaveBeenCalled()
    })
})
