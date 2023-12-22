import useFetchComment from '@/hooks/useFetchComment'
import { renderHook, waitFor } from '@testing-library/react'

const mockUserState = {
    getEpochKeys: jest
        .fn()
        .mockReturnValue(['epochKey-1', 'epochKey-2', 'epochKey-3']),
}

jest.mock('@/contexts/User', () => ({
    useUser: () => ({
        userState: mockUserState,
    }),
}))

beforeEach(() => {
    jest.clearAllMocks()
    global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () =>
            Promise.resolve([
                {
                    commentId: '1',
                    epoch: 9999,
                    epochKey: 'epochKey-1',
                    content: 'Comment content 1',
                    publishedAt: Date.now(),
                    transactionHash: 'txHash-1',
                },
                {
                    commentId: '2',
                    epoch: 9999,
                    epochKey: 'epochKey-2',
                    content: 'Comment content 2',
                    publishedAt: Date.now(),
                    transactionHash: 'txHash-2',
                },
            ]),
    })
})

afterEach(() => {
    jest.restoreAllMocks()
})

describe('useFetchComment', () => {
    it('fetches comments successfully when postId is provided', async () => {
        const { result, rerender } = renderHook(() =>
            useFetchComment('test-post-id')
        )

        await waitFor(() => {
            // Expectations about the fetch call
            expect(global.fetch).toHaveBeenCalledWith(
                expect.stringContaining('test-post-id')
            )

            const expectedComment = {
                postId: 'test-post-id',
                commentId: '1',
                epoch: 9999,
                epochKey: 'epochKey-1',
                content: 'Comment content 1',
                publishedAt: expect.any(Number),
                transactionHash: 'txHash-1',
                status: 'success',
                isMine: false,
            }

            expect(result.current.data).toEqual(
                expect.arrayContaining([
                    expect.objectContaining(expectedComment),
                ])
            )
        })
    })

    it('does not fetch comments when postId is not provided', async () => {
        const { result } = renderHook(() => useFetchComment())

        expect(global.fetch).not.toHaveBeenCalled()
        expect(result.current.data).toEqual([])
    })
})
