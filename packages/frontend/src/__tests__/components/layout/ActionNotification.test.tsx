import '@testing-library/jest-dom'
import ActionNotification from '@/components/layout/ActionNotification'
import { ActionType, addAction } from '@/contexts/Actions'
import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

describe('ActionNotification', () => {
    it('should display nothing if no actions', () => {
        render(<ActionNotification />)

        const countButton = screen.queryByTestId('action-count-button')
        expect(countButton).toBeNull()
    })

    it('should display action label if action is added', () => {
        const postData = {
            id: 'post-id-1',
            content: 'This is a post',
        }

        render(<ActionNotification />)

        act(() => {
            addAction(ActionType.Post, postData)
        })

        const countButton = screen.queryByTestId('action-count-button')
        expect(countButton).toBeInTheDocument()
    })

    it('should open a dialog to display action list', async () => {
        const postData = {
            id: 'post-id-1',
            content: 'This is a post',
        }

        render(<ActionNotification />)

        act(() => {
            addAction(ActionType.Post, postData)
        })

        const countButton = screen.getByTestId('action-count-button')
        await userEvent.click(countButton)

        const actionDialog = screen.queryByTestId('actions-dialog')
        expect(actionDialog).toBeInTheDocument()
    })
})
