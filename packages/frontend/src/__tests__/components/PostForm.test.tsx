import React from 'react'
import { render, fireEvent, screen } from '@testing-library/react'
import PostForm from '../../components/PostForm'
import '@testing-library/jest-dom'
import { expect } from '@jest/globals'

jest.mock('@uidotdev/usehooks', () => ({
    useIsFirstRender: jest.fn().mockReturnValue(false),
}))

test('<PostForm /> should render and handle interactions', () => {
    const mockOnCancel = jest.fn()
    const mockOnSaveDraft = jest.fn()
    const mockOnFetchDraft = jest.fn()
    const mockOnSubmit = jest.fn()

    render(
        <PostForm
            onCancel={mockOnCancel}
            onSaveDraft={mockOnSaveDraft}
            onFetchDraft={mockOnFetchDraft}
            onSubmit={mockOnSubmit}
        />
    )

    // @ts-ignore
    expect(screen.getByTitle('cancel a post')).toBeInTheDocument()
    // @ts-ignore
    expect(screen.getByTitle('save a draft')).toBeInTheDocument()
    // @ts-ignore
    expect(screen.getByTitle('view a draft')).toBeInTheDocument()
    // @ts-ignore
    expect(screen.getByTitle('submit a post')).toBeInTheDocument()

    // Simulate button clicks
    fireEvent.click(screen.getByTitle('cancel a post'))
    expect(mockOnCancel).toHaveBeenCalled()

    fireEvent.click(screen.getByTitle('save a draft'))
    expect(mockOnSaveDraft).toHaveBeenCalled()

    fireEvent.click(screen.getByTitle('view a draft'))
    expect(mockOnFetchDraft).toHaveBeenCalled()

    // Simulate form submission
    // Assuming RichTextEditor sets value in contenteditable div
    const editableContent = screen.getByRole('textbox', {
        name: /post editor/i,
    })
    editableContent.textContent = 'Test Content'
    fireEvent.input(editableContent)
})
