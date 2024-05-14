import {
    ActionType,
    addAction,
    failActionById,
    succeedActionById,
} from '@/contexts/Actions'
import useRemoveComment from '@/hooks/useRemoveComment'
import { wrapper } from '@/utils/test-helpers'
import { act, renderHook } from '@testing-library/react'

jest.mock('@/contexts/Actions', () => ({
    addAction: jest.fn(),
    failActionById: jest.fn(),
    succeedActionById: jest.fn(),
    ActionType: { DeleteComment: 'deleteComment' },
}))

jest.mock('@/contexts/Actions', () => ({
    addAction: jest.fn().mockReturnValue('mock_action_id'),
    failActionById: jest.fn(),
    succeedActionById: jest.fn(),
    ActionType: { Comment: 'comment' },
}))

jest.mock('@/hooks/useWeb3Provider', () => ({
    useWeb3Provider: () => ({
        getGuaranteedProvider: () => ({
            waitForTransaction: jest.fn().mockResolvedValue({
                logs: [
                    {
                        topics: ['', '', '', '1111'],
                    },
                ],
            }),
        }),
    }),
}))

jest.mock('@/hooks/useUserState', () => ({
    useUserState: () => ({
        getGuaranteedUserState: () => ({
            latestTransitionedEpoch: jest.fn().mockResolvedValue(9999),
            genEpochKeyLiteProof: jest.fn().mockResolvedValue({
                publicSignals: 'mocked_signals',
                proof: 'mocked_proof',
                epoch: 0,
                epochKey: 'mocked_epockKey',
            }),
            waitForSync: jest.fn().mockResolvedValue('success'),
            sync: {
                calcCurrentEpoch: jest.fn().mockReturnValue(9999),
            },
        }),
    }),
}))

jest.mock('@/hooks/useUserStateTransition', () => ({
    useUserStateTransition: () => ({
        stateTransition: jest.fn(),
    }),
}))

jest.mock('@/hooks/useActionCount', () => ({
    useActionCount: () => 1,
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
            json: () => Promise.resolve({ txHash: 'mock_transaction' }),
        })
        const { result } = renderHook(() => useRemoveComment(), { wrapper })

        const postId = '1'
        const commentId = '2'
        const epoch = 9999
        const nonce = 1

        await act(async () => {
            await result.current.removeComment({
                postId,
                commentId,
                epoch,
                nonce,
            })
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

        const { result } = renderHook(() => useRemoveComment(), { wrapper })

        const postId = '1'
        const commentId = '2'
        const epoch = 9999
        const nonce = 1

        try {
            await result.current.removeComment({
                postId,
                commentId,
                epoch,
                nonce,
            })
        } catch {
            /* empty */
        }

        expect(addAction).toHaveBeenCalledWith(ActionType.DeleteComment, {
            postId,
            commentId,
            epoch,
        })
        expect(failActionById).toHaveBeenCalledWith('mock_action_id')
    })
})
