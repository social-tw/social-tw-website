import { SERVER } from '@/constants/config'
import * as actionLib from '@/features/core/stores/actions'
import { wrapper } from '@/utils/test-helpers/wrapper'
import { act, renderHook } from '@testing-library/react'
import nock from 'nock'
import { useCreateComment } from './useCreateComment'

jest.mock('@/features/core/hooks/useWeb3Provider/useWeb3Provider', () => ({
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

jest.mock('@/features/core/hooks/useUserState/useUserState', () => ({
    useUserState: () => ({
        userState: {
            getEpochKeys: jest
                .fn()
                .mockReturnValue(['epochKey-1', 'epochKey-2'].join(',')),
            sync: {
                calcCurrentEpoch: jest.fn().mockReturnValue(2),
                calcEpochRemainingTime: jest.fn().mockReturnValue(120),
            },
        },
        getGuaranteedUserState: () => ({
            getData: () => [BigInt(2), BigInt(1), BigInt(0), BigInt(0)],
            waitForSync: jest.fn(),
            latestTransitionedEpoch: jest.fn().mockResolvedValue(1),
            genEpochKeyProof: jest.fn().mockResolvedValue({
                publicSignals: 'mocked_signals',
                proof: 'mocked_proof',
                epoch: 0,
                epochKey: 'mocked_epockKey',
            }),
            genUserStateTransitionProof: jest.fn().mockResolvedValue({
                publicSignals: 'mocked_signals',
                proof: 'mocked_proof',
                epoch: 0,
                epochKey: 'mocked_epockKey',
            }),
            genProveReputationProof: jest.fn().mockResolvedValue({
                publicSignals: 'mocked_signals',
                proof: 'mocked_proof',
                epoch: 0,
                epochKey: 'mocked_epockKey',
            }),
            sync: {
                calcCurrentEpoch: jest.fn().mockReturnValue(2),
            },
        }),
    }),
}))

describe('useCreateComment', () => {
    afterEach(() => {
        nock.cleanAll()
        jest.clearAllMocks()
    })

    it.skip('succeed to create a comment', async () => {
        const expectation = nock(SERVER)
            .get('/api/counter?epks=epochKey-1_epochKey-2')
            .reply(200, { counter: 1 })
            .post('/api/transition')
            .reply(200, { hash: '0xhash' })
            .post('/api/comment')
            .reply(200, { hash: '0xhash' })
            .get('/api/counter?epks=epochKey-1_epochKey-2')
            .reply(200, { counter: 2 })

        const succeedActionById = jest.spyOn(actionLib, 'succeedActionById')

        const { result } = renderHook(useCreateComment, { wrapper })

        const comment = {
            postId: 'mock-post-id',
            content: 'mock-content',
        }
        await act(async () => {
            await result.current.createComment(comment)
        })

        expect(succeedActionById).toHaveBeenCalled()
        expectation.done()
    })

    it.skip('fail to create a comment', async () => {
        const expectation = nock(SERVER)
            .persist()
            .get('/api/counter?epks=epochKey-1_epochKey-2')
            .reply(200, { counter: 1 })
            .post('/api/transition')
            .reply(200, { hash: '0xhash' })
            .post('/api/comment')
            .reply(400, { error: 'error' })
            .get('/api/counter?epks=epochKey-1_epochKey-2')
            .reply(200, { counter: 2 })

        const failActionById = jest.spyOn(actionLib, 'failActionById')

        const { result } = renderHook(() => useCreateComment(), { wrapper })

        const comment = {
            postId: 'mock-post-id',
            content: 'mock-content',
        }

        await act(async () => {
            await result.current.createComment(comment).catch(() => null)
        })

        expect(failActionById).toHaveBeenCalled()
        expectation.done()
        expectation.persist(false)
    })
})
