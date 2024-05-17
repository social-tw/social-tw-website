import nock from 'nock'
import { act, renderHook } from '@testing-library/react'
import { wrapper } from '@/utils/test-helpers/wrapper'
import { useVotes } from './useVotes'
import { SERVER } from '@/config'
import { VoteAction } from '@/types/Vote'

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
            getEpochKeys: jest
                .fn()
                .mockReturnValue(['epochKey-1', 'epochKey-2'].join(',')),
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

describe('useVotes', () => {
    afterAll(() => {
        nock.restore()
        jest.clearAllMocks()
    })

    it('succeed to vote a post', async () => {
        const expectation = nock(SERVER)
            .get('/api/counter?epks=epochKey-1_epochKey-2')
            .reply(200, { counter: 1 })
            .post('/api/vote')
            .reply(200, { hash: '0xhash' })
            .get(
                '/api/my-account/votes?epks=epochKey-1,epochKey-2_epochKey-1,epochKey-2_epochKey-1,epochKey-2&direction=asc&sortKey=publishedAt',
            )
            .reply(200, [])

        const { result } = renderHook(useVotes, { wrapper })

        const vote = {
            id: 'post-id',
            voteAction: VoteAction.UPVOTE,
        }
        await act(async () => {
            await result.current.createVote(vote)
        })

        expectation.done()
    })

    it('fail to vote a post', async () => {
        const expectation = nock(SERVER)
            .get('/api/counter?epks=epochKey-1_epochKey-2')
            .reply(200, { counter: 1 })
            .post('/api/vote')
            .reply(400, { error: 'error' })

        const { result } = renderHook(() => useVotes(), { wrapper })

        const vote = {
            id: 'post-id',
            voteAction: VoteAction.UPVOTE,
        }

        await act(async () => {
            await result.current.createVote(vote).catch(() => null)
        })

        expectation.done()
    })
})
