import { act, render, screen } from '@testing-library/react'
import { ActionType, addAction } from '@/features/core'
import ActionTable from './ActionTable'

describe('ActionTable', () => {
    it('should display action list', () => {
        render(<ActionTable />)

        const postData = {
            id: 'post-id-1',
            content: 'This is a post',
            epochKey: 'epochKey',
            transactionHash: 'hash',
        }

        act(() => {
            addAction(ActionType.Post, postData)
        })

        expect(screen.getByText('Time')).toBeInTheDocument()
        expect(screen.getByText('Action')).toBeInTheDocument()
        expect(screen.getByText('Status')).toBeInTheDocument()
        expect(screen.getByText('Link')).toBeInTheDocument()
    })
})