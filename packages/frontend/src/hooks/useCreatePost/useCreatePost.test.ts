import nock from 'nock'
import { act, renderHook } from '@testing-library/react'
import { wrapper } from '@/utils/test-helpers/wrapper'
import { useCreatePost } from './useCreatePost'
import { SERVER } from '@/config'
import * as actionLib from '@/contexts/Actions'

jest.mock('@/hooks/useWeb3Provider/useWeb3Provider', () => ({
    useWeb3Provider: () => ({
        getGuaranteedProvider: () => ({
            waitForTransaction: jest.fn().mockResolvedValue({
                logs: [
                    {
                        topics: ['', '', '1111', ''],
                    },
                ],
            }),
        }),
    }),
}))

jest.mock('@/hooks/useUserState/useUserState', () => ({
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
            sync: {
                calcCurrentEpoch: jest.fn().mockReturnValue(2),
            },
        }),
    }),
}))

describe('useCreatePost', () => {
    afterEach(() => {
        nock.cleanAll()
        jest.clearAllMocks()
    })

    it('succeed to create a post', async () => {
        const expectation = nock(SERVER)
            .get('/api/counter?epks=epochKey-1_epochKey-2')
            .reply(200, { counter: 1 })
            .post('/api/transition')
            .reply(200, { hash: '0xhash' })
            .post('/api/post')
            .reply(200, { hash: '0xhash' })
            .get('/api/counter?epks=epochKey-1_epochKey-2')
            .reply(200, { counter: 2 })

        const succeedActionById = jest.spyOn(actionLib, 'succeedActionById')

        const { result } = renderHook(useCreatePost, { wrapper })

        const post = {
            content: 'mock-content',
        }
        await act(async () => {
            await result.current.createPost(post)
        })

        expect(succeedActionById).toHaveBeenCalled()
        expectation.done()
    })

    it('fail to create a post', async () => {
        const expectation = nock(SERVER)
            .get('/api/counter?epks=epochKey-1_epochKey-2')
            .reply(200, { counter: 1 })
            .post('/api/transition')
            .reply(200, { hash: '0xhash' })
            .post('/api/post')
            .reply(400, { error: 'error' })
            .get('/api/counter?epks=epochKey-1_epochKey-2')
            .reply(200, { counter: 2 })

        const failActionById = jest.spyOn(actionLib, 'failActionById')

        const { result } = renderHook(() => useCreatePost(), { wrapper })

        const post = {
            content: 'mock-content',
        }

        await act(async () => {
            await result.current.createPost(post).catch(() => null)
        })

        expect(failActionById).toHaveBeenCalled()
        expectation.done()
    })
})
