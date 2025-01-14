import { useUserState } from '@/features/core'
import { useWaitForTransactionReport } from '@/features/reporting/hooks/useGetWaitForTransactReport/useWaitForTransactionReport'
import { useReportAdjudicatorReputation } from '@/features/reporting/hooks/useReportAdjudicatorReputation/useReportAdjudicatorReputation'
import { useReportEpochKeyReputation } from '@/features/reporting/hooks/useReportEpochKeyReputation/useReportEpochKeyReputation'
import { isMyAdjudicateNullifier } from '@/features/reporting/utils/helpers'
import { ReportHistory, RepUserType } from '@/types/Report'
import { isMyEpochKey } from '@/utils/helpers/epochKey'
import { UserState } from '@unirep/core'
import { useCallback, useEffect } from 'react'

function canClaimReportorReputation(
    userState: UserState,
    report: ReportHistory,
) {
    return (
        isMyEpochKey(userState, report.reportEpoch, report.reportorEpochKey) &&
        !report.reportorClaimedRep
    )
}

function canClaimRespondentReputation(
    userState: UserState,
    report: ReportHistory,
) {
    return (
        report.respondentEpochKey &&
        isMyEpochKey(
            userState,
            report.object.epoch,
            report.respondentEpochKey,
        ) &&
        !report.respondentClaimedRep
    )
}

function canClaimAdjudicatorReputation(
    userState: UserState,
    report: ReportHistory,
) {
    return report.adjudicatorsNullifier?.some(
        (adj) =>
            isMyAdjudicateNullifier(
                userState,
                report.reportId,
                adj.nullifier,
            ) && !adj.claimed,
    )
}

export function useBackgroundReputationClaim() {
    const { data: reports } = useWaitForTransactionReport()

    const { mutateAsync: claimAdjucatorReputation } =
        useReportAdjudicatorReputation()

    const { mutateAsync: claimEpochKeyReputation } =
        useReportEpochKeyReputation()

    const { userState } = useUserState()

    const claimReputation = useCallback(async () => {
        if (!reports || !userState) return

        for (const report of reports) {
            if (canClaimReportorReputation(userState, report)) {
                await claimEpochKeyReputation({
                    reportId: report.reportId,
                    reportedEpochKey: BigInt(report.reportorEpochKey),
                    reportedEpoch: report.reportEpoch,
                    repUserType: RepUserType.REPORTER,
                })
            }

            if (
                canClaimRespondentReputation(userState, report) &&
                report.respondentEpochKey
            ) {
                await claimEpochKeyReputation({
                    reportId: report.reportId,
                    reportedEpochKey: BigInt(report.respondentEpochKey),
                    reportedEpoch: report.object.epoch,
                    repUserType: RepUserType.RESPONDENT,
                })
            }

            if (canClaimAdjudicatorReputation(userState, report)) {
                await claimAdjucatorReputation(report.reportId)
            }
        }
    }, [claimAdjucatorReputation, claimEpochKeyReputation, reports, userState])

    useEffect(() => {
        claimReputation()
    }, [claimReputation])
}
