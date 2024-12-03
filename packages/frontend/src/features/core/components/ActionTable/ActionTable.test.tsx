import { ActionType, addAction } from '@/features/core'
import { TestWrapper } from '@/utils/test-helpers/wrapper'
import { act, render, screen } from '@testing-library/react'
import { useState } from 'react'
import * as router from 'react-router'
import ActionTable from './ActionTable'

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

        expect(screen.getByText('時間')).toBeInTheDocument()
        expect(screen.getByText('操作')).toBeInTheDocument()
        expect(screen.getByText('上鏈交易狀態')).toBeInTheDocument()
        expect(screen.getByText('連結')).toBeInTheDocument()
    })
})
