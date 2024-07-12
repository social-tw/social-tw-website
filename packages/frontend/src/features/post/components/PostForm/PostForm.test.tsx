import { expect } from '@jest/globals'
import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import PostForm from './PostForm'

jest.mock('@uidotdev/usehooks', () => ({
    useIsFirstRender: jest.fn().mockReturnValue(false),
}))

test('<PostForm /> should render and handle interactions', () => {
    const mockOnCancel = jest.fn()
    const mockOnSubmit = jest.fn()

    render(
        <MemoryRouter>
            <PostForm onCancel={mockOnCancel} onSubmit={mockOnSubmit} />
        </MemoryRouter>,
    )

    // @ts-ignore
    expect(screen.getByTitle('cancel a post')).toBeInTheDocument()
    // @ts-ignore
    expect(screen.getByTitle('submit a post')).toBeInTheDocument()

    // Simulate button clicks
    fireEvent.click(screen.getByTitle('cancel a post'))
    expect(mockOnCancel).toHaveBeenCalled()

    // Simulate form submission
    // Assuming RichTextEditor sets value in contenteditable div
    const editableContent = screen.getByRole('textbox', {
        name: /post editor/i,
    })
    editableContent.textContent = 'Test Content'
    fireEvent.input(editableContent)
})
