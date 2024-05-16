import {
    ActionType,
    addAction,
    failActionById,
    succeedActionById,
} from '@/contexts/Actions'
import useCreateComment from '@/hooks/useCreateComment'
import { act, renderHook } from '@testing-library/react'

jest.mock('@/contexts/User', () => ({
    useUser: () => ({
        userState: {
            latestTransitionedEpoch: jest.fn().mockResolvedValue(9999),
            genEpochKeyProof: jest.fn().mockResolvedValue({
                publicSignals: 'mocked_signals',
                proof: 'mocked_proof',
                epoch: 0,
                epochKey: 'mocked_epockKey',
            }),
            waitForSync: jest.fn().mockResolvedValue('success'),
            sync: {
                calcCurrentEpoch: jest.fn().mockReturnValue(9999),
            },
        },
        stateTransition: jest.fn().mockResolvedValue('success'),
        provider: {
            waitForTransaction: jest.fn().mockResolvedValue({
                logs: [
                    {
                        topics: ['', '', '', '1111'],
                    },
                ],
            }),
        },
        loadData: jest.fn().mockResolvedValue('success'),
    }),
}))

jest.mock('@/contexts/Actions', () => ({
    addAction: jest.fn(),
    failActionById: jest.fn(),
    succeedActionById: jest.fn(),
    ActionType: { Comment: 'comment' },
}))

jest.mock('@/hooks/useActionCount', () => jest.fn().mockReturnValue(1))

beforeEach(() => {
    jest.clearAllMocks()
    jest.mocked(addAction).mockReturnValue('mock_action_id')
    global.fetch = jest.fn()
})

afterEach(() => {
    jest.restoreAllMocks()
})

describe('useCreateComment', () => {
    it('successfully creates a comment', async () => {
        ;(global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve({ txHash: 'mock_transaction' }),
        })

        const { result } = renderHook(() => useCreateComment())

        const postId = 'mock_postId'
        const content = 'mock_content'

        await act(async () => {
            await result.current.create(postId, content)
        })

        expect(addAction).toHaveBeenCalledWith(
            ActionType.Comment,
            expect.any(Object),
        )
        expect(global.fetch).toHaveBeenCalledWith(
            expect.stringContaining('/api/comment'),
            expect.any(Object),
        )
        expect(succeedActionById).toHaveBeenCalled()
    })

    it('failed creating a comment', async () => {
        ;(global.fetch as jest.Mock).mockRejectedValueOnce(
            new Error('API call failed'),
        )

        const { result } = renderHook(() => useCreateComment())

        const postId = 'mock_postId'
        const content = 'mock_content'

        await act(async () => {
            try {
                await result.current.create(postId, content)
            } catch {
                /* empty */
            }
        })

        expect(addAction).toHaveBeenCalledWith(
            ActionType.Comment,
            expect.any(Object),
        )
        expect(failActionById).toHaveBeenCalledWith('mock_action_id')
    })
})
