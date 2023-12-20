import {
    ActionType, addAction, failActionById, succeedActionById
} from "@/contexts/Actions";
import useCreateComment from "@/hooks/useCreateComment";
import { act, renderHook } from "@testing-library/react";

jest.mock('@/contexts/User', () => ({
    useUser: () => ({
        userState: {
            latestTransitionedEpoch: jest.fn().mockResolvedValue(9999),
            genEpochKeyProof: jest.fn().mockResolvedValue({
                publicSignals: 'mocked_signals',
                proof: 'mocked_proof'
            }),
            waitForSync: jest.fn().mockResolvedValue('success'),
            sync: {
                calcCurrentEpoch: jest.fn().mockReturnValue(9999)
            },
        },
        stateTransition: jest.fn().mockResolvedValue('success'),
        provider: {
            waitForTransaction: jest.fn().mockResolvedValue('success')
        },
        loadData: jest.fn().mockResolvedValue('success')
    })
}))

jest.mock('@/contexts/Actions', () => ({
    addAction: jest.fn(),
    failActionById: jest.fn(),
    succeedActionById: jest.fn(),
    ActionType: { Comment: 'comment' }
}))

beforeEach(() => {
    jest.clearAllMocks()
    jest.mocked(addAction).mockReturnValue('mock_action_id')
    global.fetch = jest.fn()
})

afterEach(() => {
    jest.restoreAllMocks()
})

describe('useCreateComment', () => {
    it('successfully generates proof', async () => {
        const { result } = renderHook(() => useCreateComment())
        const postId = 'testPostId'
        const content = 'testContent'

        let proofResult
        await act(async () => {
            proofResult = await result.current.genProof(postId, content)
        })

        expect(proofResult).toHaveProperty('proof')
        expect(proofResult).toHaveProperty('epoch', 9999)
    })

    it('successfully creates a comment', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            json: () => Promise.resolve({ transaction: 'mock_transaction' })
        })

        const { result } = renderHook(() => useCreateComment())

        const proof = 'mock_proof'
        const postId = 'mock_postId'
        const content = 'mock_content'
        const epoch = 9999

        await act(async () => {
            await result.current.create(proof, postId, content, epoch)
        })

        expect(addAction).toHaveBeenCalledWith(ActionType.Comment, expect.any(Object))
        expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/api/comment'), expect.any(Object))
        expect(succeedActionById).toHaveBeenCalledWith('mock_action_id', { transactionHash: 'mock_transaction' })
    })

    it('failed creating a comment', async () => {
        (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API call failed'))

        const { result } = renderHook(() => useCreateComment())

        const proof = 'mock_proof'
        const postId = 'mock_postId'
        const content = 'mock_content'
        const epoch = 9999

        await act(async () => {
            await result.current.create(proof, postId, content, epoch)
        })

        expect(addAction).toHaveBeenCalledWith(ActionType.Comment, expect.any(Object))
        expect(failActionById).toHaveBeenCalledWith('mock_action_id')
    })
})
