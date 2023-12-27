import {
    ActionType,
    addAction,
    failActionById,
    succeedActionById,
} from '@/contexts/Actions'
import useDeleteComment from '@/hooks/useDeleteComment'
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

describe('useDeleteComment', () => {
    it('successfully generates proof', async () => {
        const { result } = renderHook(() => useDeleteComment())

        const epoch = 9999
        const transactionHash = 'mock_transaction_hash'

        let proof

        await act(async () => {
            proof = await result.current.genProof(epoch, transactionHash)
        })

        expect(proof).toStrictEqual({
            transactionHash,
            publicSignals: 'mocked_signals',
            proof: 'mocked_proof',
        })
    })

    it('successfully deletes a comment', async () => {
        ;(global.fetch as jest.Mock).mockResolvedValueOnce({
            json: () => Promise.resolve({ transaction: 'mock_transaction' }),
        })
        const { result } = renderHook(() => useDeleteComment())

        const proof = 'mock_proof'
        const epoch = 9999
        const transactionHash = 'mock_transaction_hash'

        await act(async () => {
            await result.current.remove(proof, epoch, transactionHash)
        })

        expect(addAction).toHaveBeenCalledWith(ActionType.DeleteComment, {
            epoch,
            transactionHash,
        })
        expect(global.fetch).toHaveBeenCalledWith(
            expect.stringContaining('/api/comment'),
            expect.objectContaining({
                method: 'DELETE',
                body: JSON.stringify(proof),
            }),
        )
        expect(succeedActionById).toHaveBeenCalledWith('mock_action_id')
        expect(result.current.isDeleted).toBe(true)
    })

    it('failed deleting a comment', async () => {
        ;(global.fetch as jest.Mock).mockRejectedValueOnce(
            new Error('API call failed'),
        )

        const { result } = renderHook(() => useDeleteComment())

        const proof = 'mock_proof'
        const epoch = 9999
        const transactionHash = 'mock_transaction_hash'

        await act(async () => {
            await result.current.remove(proof, epoch, transactionHash)
        })

        expect(addAction).toHaveBeenCalledWith(ActionType.DeleteComment, {
            epoch,
            transactionHash,
        })
        expect(failActionById).toHaveBeenCalledWith('mock_action_id')
    })
})
