import nock from 'nock'
import { act, renderHook } from '@testing-library/react'
import { wrapper } from '@/utils/test-helpers/wrapper'
import { SERVER } from '@/constants/config'
import { useBackgroundReputationClaim } from './useBackgroundReputationClaim'
import { RepUserType, ReputationType } from '@/types/Report'

jest.mock('@/features/core/hooks/useUserState/useUserState', () => ({
    useUserState: () => ({
        getGuaranteedUserState: () => ({
            waitForSync: jest.fn(),
            genEpochKeyLiteProof: jest.fn().mockResolvedValue({
                publicSignals: 'mocked_signals',
                proof: 'mocked_proof',
                epoch: 1,
                epochKey: 'mocked_epochKey',
            }),
            sync: {
                calcCurrentEpoch: jest.fn().mockReturnValue(2),
            },
        }),
    }),
}))

describe('useBackgroundReputationClaim', () => {
    afterEach(() => {
        nock.cleanAll()
        jest.clearAllMocks()
    })

    it('should successfully claim positive reputation', async () => {
        const expectation = nock(SERVER)
            .post('/api/claim-positive-reputation')
            .reply(200, { txHash: '0xhash', score: 10 })

        const { result } = renderHook(() => useBackgroundReputationClaim(), {
            wrapper,
        })

        await act(async () => {
            await result.current.claimReputationInBackground(
                'report-1',
                RepUserType.REPORTER,
                true,
            )
        })

        expect(result.current.isClaimingReputation).toBe(false)
        expect(result.current.claimReputationError).toBeNull()

        expectation.done()
    })

    it('should successfully claim negative reputation', async () => {
        const expectation = nock(SERVER)
            .post('/api/claim-negative-reputation')
            .reply(200, { txHash: '0xhash', score: -5 })

        const { result } = renderHook(() => useBackgroundReputationClaim(), {
            wrapper,
        })

        await act(async () => {
            await result.current.claimReputationInBackground(
                'report-2',
                RepUserType.POSTER,
                false,
            )
        })

        expect(result.current.isClaimingReputation).toBe(false)
        expect(result.current.claimReputationError).toBeNull()

        expectation.done()
    })

    it('should handle error when claiming reputation fails', async () => {
        const expectation = nock(SERVER)
            .post('/api/claim-positive-reputation')
            .reply(400, { error: 'Claim failed' })

        const { result } = renderHook(() => useBackgroundReputationClaim(), {
            wrapper,
        })

        await act(async () => {
            await result.current.claimReputationInBackground(
                'report-3',
                RepUserType.VOTER,
                true,
                'nullifier-1',
            )
        })

        expect(result.current.isClaimingReputation).toBe(false)
        expect(result.current.claimReputationError).toBeTruthy()

        expectation.done()
    })

    it('should handle voter claim with nullifier', async () => {
        const expectation = nock(SERVER)
            .post('/api/claim-positive-reputation')
            .reply(200, { txHash: '0xhash', score: 5 })

        const { result } = renderHook(() => useBackgroundReputationClaim(), {
            wrapper,
        })

        await act(async () => {
            await result.current.claimReputationInBackground(
                'report-4',
                RepUserType.VOTER,
                true,
                'nullifier-2',
            )
        })

        expect(result.current.isClaimingReputation).toBe(false)
        expect(result.current.claimReputationError).toBeNull()

        expectation.done()
    })
})
