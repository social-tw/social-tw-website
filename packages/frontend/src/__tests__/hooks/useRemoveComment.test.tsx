import {
    ActionType,
    addAction,
    failActionById,
    succeedActionById,
} from '@/contexts/Actions'
import useRemoveComment from '@/hooks/useRemoveComment'
import { act, renderHook } from '@testing-library/react'

jest.mock('@/contexts/User', () => ({
    useUser: () => ({
        userState: {
            latestTransitionedEpoch: jest.fn().mockResolvedValue(9999),
            genEpochKeyLiteProof: jest.fn().mockResolvedValue({
                publicSignals: 'mocked_signals',
                proof: 'mocked_proof',
            }),
            waitForSync: jest.fn().mockResolvedValue('success'),
            sync: {
                calcCurrentEpoch: jest.fn().mockReturnValue(9999),
            },
        },
        stateTransition: jest.fn().mockResolvedValue('success'),
        provider: {
            waitForTransaction: jest.fn().mockResolvedValue('success'),
        },
        loadData: jest.fn().mockResolvedValue('success'),
    }),
}))

jest.mock('@/contexts/Actions', () => ({
    addAction: jest.fn(),
    failActionById: jest.fn(),
    succeedActionById: jest.fn(),
    ActionType: { DeleteComment: 'deleteComment' },
}))

beforeEach(() => {
    jest.clearAllMocks()
    jest.mocked(addAction).mockReturnValue('mock_action_id')
    global.fetch = jest.fn()
})

afterEach(() => {
    jest.restoreAllMocks() // Restore all mocks to their original state
})

describe('useRemoveComment', () => {
    it('successfully deletes a comment', async () => {
        ;(global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve({ transaction: 'mock_transaction' }),
        })
        const { result } = renderHook(() => useRemoveComment())

        const postId = '1'
        const commentId = '2'
        const epoch = 9999

        await act(async () => {
            await result.current.remove(postId, commentId, epoch)
        })

        expect(addAction).toHaveBeenCalledWith(ActionType.DeleteComment, {
            postId,
            commentId,
            epoch,
        })
        expect(global.fetch).toHaveBeenCalledWith(
            expect.stringContaining('/api/comment'),
            expect.any(Object),
        )
        expect(succeedActionById).toHaveBeenCalledWith('mock_action_id')
    })

    it('failed deleting a comment', async () => {
        ;(global.fetch as jest.Mock).mockRejectedValueOnce(
            new Error('API call failed'),
        )

        const { result } = renderHook(() => useRemoveComment())

        const postId = '1'
        const commentId = '2'
        const epoch = 9999

        await act(async () => {
            await result.current.remove(postId, commentId, epoch)
        })

        expect(addAction).toHaveBeenCalledWith(ActionType.DeleteComment, {
            postId,
            commentId,
            epoch,
        })
        expect(failActionById).toHaveBeenCalledWith('mock_action_id')
    })
})
