import { SERVER } from '@/constants/config'
import { VoteAction } from '@/types/Vote'
import { wrapper } from '@/utils/test-helpers/wrapper'
import { act, renderHook } from '@testing-library/react'
import nock from 'nock'
import { useVotes } from './useVotes'

jest.mock('@/features/core/hooks/useRelayConfig/useRelayConfig', () => ({
    useRelayConfig: () => ({
        data: {
            EPOCH_LENGTH: 300,
        },
        isPending: false,
        isSuccess: true,
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
            genEpochKeyLiteProof: jest.fn().mockResolvedValue({
                publicSignals: 'mocked_signals',
                proof: 'mocked_proof',
                epoch: 1,
                epochKey: 'mocked_epochKeyLite',
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

describe('useVotes', () => {
    afterEach(() => {
        nock.cleanAll()
        jest.clearAllMocks()
    })

    it('succeed to vote a post', async () => {
        const expectation = nock(SERVER)
            .get('/api/counter?epks=epochKey-1_epochKey-2')
            .reply(200, { counter: 1 })
            .post('/api/vote')
            .reply(200, { hash: '0xhash' })
            .get('/api/counter?epks=epochKey-1_epochKey-2')
            .reply(200, { counter: 2 })

        const { result } = renderHook(useVotes, { wrapper })

        const vote = {
            id: 'post-id',
            voteAction: VoteAction.UPVOTE,
            votedNonce: 1,
            votedEpoch: 1,
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
            .get('/api/counter?epks=epochKey-1_epochKey-2')
            .reply(200, { counter: 2 })

        const { result } = renderHook(() => useVotes(), { wrapper })

        const vote = {
            id: 'post-id',
            voteAction: VoteAction.UPVOTE,
            votedNonce: 1,
            votedEpoch: 1,
        }

        await act(async () => {
            await result.current.createVote(vote).catch(() => null)
        })

        expectation.done()
    })
})
