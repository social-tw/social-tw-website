import nock from 'nock'
import { act, renderHook } from '@testing-library/react'
import { wrapper } from "@/utils/test-helpers/wrapper"
import { useCreateComment } from "./useCreateComment"
import { SERVER } from '@/config'
import * as actionLib from '@/contexts/Actions'

jest.mock('@/hooks/useWeb3Provider/useWeb3Provider', () => ({
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

jest.mock('@/hooks/useUserState/useUserState', () => ({
    useUserState: () => ({
        userState: {
            getEpochKeys: jest.fn().mockReturnValue(['epochKey-1', 'epochKey-2'].join(',')),
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


describe('useCreateComment', () => {
    afterAll(() => {
        nock.restore()
        jest.clearAllMocks()
    })
    
    it('successfully creates a comment', async () => {
        const expectation = nock(SERVER)
            .get('/api/counter?epks=epochKey-1_epochKey-2').reply(200, { counter: 1 })
            .post('/api/transition').reply(200, { hash: '0xhash'})
            .post('/api/comment').reply(200, { hash: '0xhash'})
        
        const succeedActionById = jest.spyOn(actionLib, 'succeedActionById')
        
        const { result } = renderHook(useCreateComment, { wrapper })

        const comment = {
            postId: 'mock-post-id',
            content: 'mock-content'
        }
        await act(async () => {
            await result.current.createComment(comment)
        })

        expect(succeedActionById).toHaveBeenCalled()
        expectation.done()
    })

    it('failed creating a comment', async () => {
        const expectation = nock(SERVER)
            .get('/api/counter?epks=epochKey-1_epochKey-2').reply(200, { counter: 1 })
            .post('/api/transition').reply(200, { hash: '0xhash'})
            .post('/api/comment').reply(400, { error: 'error' })

        const failActionById = jest.spyOn(actionLib, 'failActionById')

        const { result } = renderHook(() => useCreateComment(), { wrapper })

        const comment = {
            postId: 'mock-post-id',
            content: 'mock-content'
        }

        await act(async () => {
            await result.current.createComment(comment).catch(() => null)
        })

        expect(failActionById).toHaveBeenCalled()
        expectation.done()
    })
})
