import { useUserState } from '@/features/core'
import { useWaitForTransactionReport } from '@/features/reporting/hooks/useGetWaitForTransactReport/useWaitForTransactionReport'
import { useReportAdjudicatorReputation } from '@/features/reporting/hooks/useReportAdjudicatorReputation/useReportAdjudicatorReputation'
import { useReportEpochKeyReputation } from '@/features/reporting/hooks/useReportEpochKeyReputation/useReportEpochKeyReputation'
import { isMyAdjudicateNullifier } from '@/features/reporting/utils/helpers'
import { RepUserType } from '@/types/Report'
import { isMyEpochKey } from '@/utils/helpers/epochKey'
import { useCallback, useEffect } from 'react'

export function useBackgroundReputationClaim() {
    const { data: reports } = useWaitForTransactionReport()
    const { mutateAsync: claimAdjucatorReputation } =
        useReportAdjudicatorReputation()
    const { mutateAsync: claimEpochKeyReputation } =
        useReportEpochKeyReputation()
    const { userState } = useUserState()

    const processReports = useCallback(async () => {
        if (!reports || !userState) return

        for (const report of reports) {
            if (!report.respondentEpochKey) continue
            if (
                isMyEpochKey(
                    userState,
                    report.reportEpoch,
                    report.reportorEpochKey,
                )
            ) {
                if (!report.reportorClaimedRep) {
                    await claimEpochKeyReputation({
                        reportId: report.reportId,
                        reportedEpochKey: BigInt(report.reportorEpochKey),
                        reportedEpoch: report.reportEpoch,
                        repUserType: RepUserType.REPORTER,
                    })
                }
            } else if (
                isMyEpochKey(
                    userState,
                    report.object.epoch,
                    report.respondentEpochKey,
                )
            ) {
                if (!report.respondentClaimedRep) {
                    await claimEpochKeyReputation({
                        reportId: report.reportId,
                        reportedEpochKey: BigInt(report.respondentEpochKey),
                        reportedEpoch: report.object.epoch,
                        repUserType: RepUserType.POSTER,
                    })
                }
            } else if (
                report.adjudicatorsNullifier?.some(
                    (adj) =>
                        isMyAdjudicateNullifier(
                            userState,
                            report.reportId,
                            adj.nullifier,
                        ) && !adj.claimed,
                )
            ) {
                await claimAdjucatorReputation(report.reportId)
            }
        }
    }, [reports, userState, claimEpochKeyReputation, claimAdjucatorReputation])

    useEffect(() => {
        processReports()
    }, [reports, processReports])
}
