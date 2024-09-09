import { useUserState } from '@/features/core'
import { RepUserType } from '@/types/Report'
import { useCallback, useEffect } from 'react'
import { useWaitForTransactionReport } from '@/features/reporting/hooks/useGetWaitForTransactReport/useWaitForTransactionReport'
import { useReportAdjucatorsReputation } from '@/features/reporting/hooks/useReportAdjicatorsReputation/useReportAdjucatorsReputation'
import { useReportEpochKeyRepuation } from '@/features/reporting/hooks/useReportEpochKeyReputation/useReportEpochKeyRepuation'
import { isMyEpochKey } from '@/utils/helpers/epochKey'
import { isMyAdjudicateNullifier } from '@/features/reporting/utils/helpers'

export function useBackgroundReputationClaim() {
    const { data: reports } = useWaitForTransactionReport()
    const { mutateAsync: claimAdjucatorRepuation } =
        useReportAdjucatorsReputation()
    const { mutateAsync: claimEpochKeyRepuation } = useReportEpochKeyRepuation()
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
                    await claimEpochKeyRepuation({
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
                    await claimEpochKeyRepuation({
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
                await claimAdjucatorRepuation(report.reportId)
            }
        }
    }, [reports, userState, claimEpochKeyRepuation, claimAdjucatorRepuation])

    useEffect(() => {
        processReports()
    }, [reports])
}
