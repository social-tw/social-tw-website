import { SERVER } from '@/constants/config'
import { wrapper } from '@/utils/test-helpers/wrapper'
import { act, renderHook } from '@testing-library/react'
import nock from 'nock'
import { useBackgroundReputationClaim } from './useBackgroundReputationClaim'
import { RepUserType } from '@/types/Report'
import {
    fetchReportsWaitingForTransaction,
    relayClaimReputation,
} from '@/utils/api'
import { QueryClient } from '@tanstack/react-query'
import { ReportHistory } from '@/features/reporting/utils/types'

// 檢查hooks input output 是否正確

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
            waitForSync: jest.fn(),
            genEpochKeyLiteProof: jest
                .fn()
                .mockResolvedValue({ epochKey: BigInt('123') }),
            genEpochKeyProof: jest.fn().mockResolvedValue({
                epoch: 1,
                nonce: 0,
                attesterId: 'mockAttesterId',
            }),
            chainId: 1,
            id: { secret: 'mockSecret' },
        }),
    }),
}))

jest.mock('@unirep-app/contracts/test/utils', () => ({
    flattenProof: jest.fn((proof) => proof),
    genProofAndVerify: jest.fn().mockResolvedValue({
        publicSignals: ['mockPublicSignal'],
        proof: ['mockProof'],
    }),
    genReportNonNullifierCircuitInput: jest.fn(),
    genReportNullifierCircuitInput: jest.fn(),
}))

jest.mock('@unirep-app/circuits/test/utils', () => ({
    genNullifier: jest.fn().mockReturnValue('mockNullifier'),
}))

jest.mock('@unirep-app/circuits/dist/src/types', () => ({
    UnirepSocialCircuit: {
        reportNullifierProof: 'mockReportNullifierProof',
        reportNonNullifierProof: 'mockReportNonNullifierProof',
    },
}))

jest.mock('@/utils/api', () => ({
    fetchReportsWaitingForTransaction: jest.fn(),
    relayClaimReputation: jest.fn(),
}))

const mockQueryClient = {
    invalidateQueries: jest.fn(),
}

jest.mock('@tanstack/react-query', () => ({
    ...jest.requireActual('@tanstack/react-query'),
    useQueryClient: () => mockQueryClient,
}))
//
// describe('useBackgroundReputationClaim', () => {
//     let queryClient: QueryClient
//
//     beforeEach(() => {
//         queryClient = new QueryClient()
//         jest.clearAllMocks()
//     })
//
//     afterEach(() => {
//         nock.cleanAll()
//         jest.clearAllMocks()
//     })
//
//     const mockReportHistory: ReportHistory = {
//         reportId: '1',
//         type: 0, // Post
//         objectId: 'post-1',
//         object: { id: 'post-1', content: 'Test post' } as any,
//         reportorEpochKey: 'epochKey-1',
//         reportorClaimedRep: false,
//         respondentEpochKey: 'epochKey-2',
//         respondentClaimedRep: false,
//         reason: 'Test reason',
//         adjudicateCount: 0,
//         adjudicatorsNullifier: [],
//         status: 1,
//         category: 1,
//         reportEpoch: 1,
//         reportAt: new Date().toISOString(),
//     }
//
//     it('should fetch reports waiting for transaction', async () => {
//         ;(fetchReportsWaitingForTransaction as jest.Mock).mockResolvedValue([
//             mockReportHistory,
//         ])
//
//         const { result } = renderHook(() => useBackgroundReputationClaim(), {
//             wrapper,
//         })
//
//         await act(async () => {
//             await result.current.claimReputationInBackground(
//                 mockReportHistory,
//                 RepUserType.REPORTER,
//             )
//         })
//
//         expect(fetchReportsWaitingForTransaction).toHaveBeenCalled()
//     })
//
//     it('should claim reputation for reporter', async () => {
//         const mockReport = {
//             ...mockReportHistory,
//             reportorClaimedRep: false,
//         }
//         ;(fetchReportsWaitingForTransaction as jest.Mock).mockResolvedValue([
//             mockReport,
//         ])
//         ;(relayClaimReputation as jest.Mock).mockResolvedValue({
//             txHash: '0xmock',
//             score: 10,
//         })
//
//         const expectation = nock(SERVER)
//             .post('/api/reputation/claim')
//             .reply(200, { txHash: '0xmock', score: 10 })
//
//         const { result } = renderHook(() => useBackgroundReputationClaim(), {
//             wrapper,
//         })
//
//         await act(async () => {
//             await result.current.claimReputationInBackground(
//                 mockReport,
//                 RepUserType.REPORTER,
//             )
//         })
//
//         expect(relayClaimReputation).toHaveBeenCalledWith(
//             '1',
//             RepUserType.REPORTER,
//             expect.any(Array),
//             expect.any(Array),
//         )
//         expectation.done()
//     })
//
//     it('should claim reputation for respondent', async () => {
//         const respondentReport = {
//             ...mockReportHistory,
//             respondentClaimedRep: false,
//         }
//         ;(fetchReportsWaitingForTransaction as jest.Mock).mockResolvedValue([
//             respondentReport,
//         ])
//         ;(relayClaimReputation as jest.Mock).mockResolvedValue({
//             txHash: '0xmock',
//             score: -5,
//         })
//
//         const expectation = nock(SERVER)
//             .post('/api/reputation/claim')
//             .reply(200, { txHash: '0xmock', score: -5 })
//
//         const { result } = renderHook(() => useBackgroundReputationClaim(), {
//             wrapper,
//         })
//
//         await act(async () => {
//             await result.current.claimReputationInBackground(
//                 respondentReport,
//                 RepUserType.POSTER,
//             )
//         })
//
//         expect(relayClaimReputation).toHaveBeenCalledWith(
//             '1',
//             RepUserType.POSTER,
//             expect.any(Array),
//             expect.any(Array),
//         )
//         expectation.done()
//     })
//
//     it('should claim reputation for voter', async () => {
//         const voterReport = {
//             ...mockReportHistory,
//             adjudicatorsNullifier: [
//                 { nullifier: 'epochKey-1', adjudicateValue: 1, claimed: false },
//             ],
//         }
//         ;(fetchReportsWaitingForTransaction as jest.Mock).mockResolvedValue([
//             voterReport,
//         ])
//         ;(relayClaimReputation as jest.Mock).mockResolvedValue({
//             txHash: '0xmock',
//             score: 5,
//         })
//
//         const expectation = nock(SERVER)
//             .post('/api/reputation/claim')
//             .reply(200, { txHash: '0xmock', score: 5 })
//
//         const { result } = renderHook(() => useBackgroundReputationClaim(), {
//             wrapper,
//         })
//
//         await act(async () => {
//             await result.current.claimReputationInBackground(
//                 voterReport,
//                 RepUserType.VOTER,
//             )
//         })
//
//         expect(relayClaimReputation).toHaveBeenCalledWith(
//             '1',
//             RepUserType.VOTER,
//             expect.any(Array),
//             expect.any(Array),
//         )
//         expectation.done()
//     })
//
//     it('should handle error when claiming reputation fails', async () => {
//         ;(fetchReportsWaitingForTransaction as jest.Mock).mockResolvedValue([
//             mockReportHistory,
//         ])
//         ;(relayClaimReputation as jest.Mock).mockRejectedValue(
//             new Error('Claim failed'),
//         )
//
//         const expectation = nock(SERVER)
//             .post('/api/reputation/claim')
//             .reply(400, { error: 'Claim failed' })
//
//         const consoleErrorSpy = jest
//             .spyOn(console, 'error')
//             .mockImplementation(() => {})
//
//         const { result } = renderHook(() => useBackgroundReputationClaim(), {
//             wrapper,
//         })
//
//         await act(async () => {
//             await result.current.claimReputationInBackground(
//                 mockReportHistory,
//                 RepUserType.REPORTER,
//             )
//         })
//
//         expect(consoleErrorSpy).toHaveBeenCalledWith(
//             'Failed to claim reputation in background:',
//             expect.any(Error),
//         )
//         expectation.done()
//
//         consoleErrorSpy.mockRestore()
//     })
//
//     it('should not claim reputation if already claimed', async () => {
//         const claimedReport = { ...mockReportHistory, reportorClaimedRep: true }
//         ;(fetchReportsWaitingForTransaction as jest.Mock).mockResolvedValue([
//             claimedReport,
//         ])
//
//         const { result } = renderHook(() => useBackgroundReputationClaim(), {
//             wrapper,
//         })
//
//         await act(async () => {
//             await result.current.claimReputationInBackground(
//                 claimedReport,
//                 RepUserType.REPORTER,
//             )
//         })
//
//         expect(relayClaimReputation).not.toHaveBeenCalled()
//     })
//
//     // it('should handle multiple reports', async () => {
//     //     const mockReports = [
//     //             {
//     //                 reportId: '6',
//     //                 reportEpoch: 1,
//     //                 reportorEpochKey: '123',
//     //                 reportorClaimedRep: false,
//     //             },
//     //             {
//     //                 reportId: '7',
//     //                 reportEpoch: 1,
//     //                 respondentEpochKey: '123',
//     //                 respondentClaimedRep: false,
//     //             },
//     //         ]
//     //     ;(fetchReportsWaitingForTransaction as jest.Mock).mockResolvedValue(mockReports)
//     //     ;(relayClaimReputation as jest.Mock).mockResolvedValue({ txHash: '0xmock', score: 10 })
//     //
//     //     const { result } = renderHook(() => useBackgroundReputationClaim(), { wrapper })
//     //
//     //     await act(async () => {
//     //         await result.current.claimReputationInBackground(mockReports[0], RepUserType.REPORTER)
//     //         await result.current.claimReputationInBackground(mockReports[1], RepUserType.POSTER)
//     //     })
//     //     expect(relayClaimReputation).toHaveBeenCalledTimes(2)
//     // })
//
//     it('should update queries after successful claim', async () => {
//         ;(fetchReportsWaitingForTransaction as jest.Mock).mockResolvedValue([
//             mockReportHistory,
//         ])
//         ;(relayClaimReputation as jest.Mock).mockResolvedValue({
//             txHash: '0xmock',
//             score: 10,
//         })
//
//         const expectation = nock(SERVER)
//             .post('/api/reputation/claim')
//             .reply(200, { txHash: '0xmock', score: 10 })
//
//         const { result } = renderHook(() => useBackgroundReputationClaim(), {
//             wrapper,
//         })
//
//         await act(async () => {
//             await result.current.claimReputationInBackground(
//                 mockReportHistory,
//                 RepUserType.REPORTER,
//             )
//         })
//
//         expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith([
//             'ReputationHistory',
//         ])
//         expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith([
//             'ReportHistory',
//             '1',
//         ])
//         expectation.done()
//     })
// })
