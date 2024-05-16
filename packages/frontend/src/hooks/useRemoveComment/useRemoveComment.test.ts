import nock from 'nock'
import { act, renderHook } from '@testing-library/react'
import { wrapper } from "@/utils/test-helpers/wrapper"
import { useRemoveComment } from "./useRemoveComment"
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
            genUserStateTransitionProof: jest.fn().mockResolvedValue({
                publicSignals: 'mocked_signals',
                proof: 'mocked_proof',
                epoch: 0,
                epochKey: 'mocked_epockKey',
            }),
            genEpochKeyProof: jest.fn().mockResolvedValue({
                publicSignals: 'mocked_signals',
                proof: 'mocked_proof',
                epoch: 0,
                epochKey: 'mocked_epockKey',
            }),
            genEpochKeyLiteProof: jest.fn().mockResolvedValue({
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


describe('useRemoveComment', () => {
    afterAll(() => {
        nock.restore()
        jest.clearAllMocks()
    })
    
    it('succeed to create a comment', async () => {
        const expectation = nock(SERVER)
            .post('/api/transition').reply(200, { hash: '0xhash'})
            .delete('/api/comment').reply(200, { hash: '0xhash'})
        
        const succeedActionById = jest.spyOn(actionLib, 'succeedActionById')
        
        const { result } = renderHook(useRemoveComment, { wrapper })

        const comment = {
            postId: '2',
            commentId: '1',
            epoch: 999,
            nonce: 2,
        }

        await act(async () => {
            await result.current.removeComment(comment)
        })

        expect(succeedActionById).toHaveBeenCalled()
        expectation.done()
    })

    it('fail to create a comment', async () => {
        const expectation = nock(SERVER)
            .post('/api/transition').reply(200, { hash: '0xhash'})
            .delete('/api/comment').reply(400, { error: 'error' })

        const failActionById = jest.spyOn(actionLib, 'failActionById')

        const { result } = renderHook(() => useRemoveComment(), { wrapper })

        const comment = {
            postId: '2',
            commentId: '1',
            epoch: 999,
            nonce: 2,
        }

        await act(async () => {
            await result.current.removeComment(comment).catch(() => null)
        })

        expect(failActionById).toHaveBeenCalled()
        expectation.done()
    })
})
