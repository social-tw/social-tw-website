import { act, render, screen } from '@testing-library/react'
import { ActionType, addAction } from '@/features/core'
import ActionTable from './ActionTable'
import * as router from 'react-router'
import { TestWrapper } from '@/utils/test-helpers/wrapper'
import { useState } from 'react'

const ActionTableWrapper = () => {
    const [, setIsOpen] = useState(false)
    return <ActionTable onClose={() => setIsOpen(false)} />
}

describe('ActionTable', () => {
    const mockedUsedNavigate = jest.fn()
    jest.spyOn(router, 'useNavigate').mockImplementation(
        () => mockedUsedNavigate,
    )

    it('should display action list', () => {
        render(
            <TestWrapper>
                <ActionTableWrapper />
            </TestWrapper>,
        )

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
