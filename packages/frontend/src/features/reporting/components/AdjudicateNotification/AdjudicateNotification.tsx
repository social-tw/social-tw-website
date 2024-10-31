import { useUserState } from '@/features/core'
import { isMyEpochKey } from '@/utils/helpers/epochKey'
import { useToggle } from '@uidotdev/usehooks'
import { useMemo } from 'react'
import { usePendingReports } from '../../hooks/usePendingReports/usePendingReports'
import { isMyAdjudicateNullifier } from '../../utils/helpers'
import Adjudicate from '../Adjudicate/Adjudicate'
import AdjudicateButton from './AdjudicateButton'
import AdjudicateCancelDialog from '../Adjudicate/AdjudicateCancelDialog'

function useActiveAdjudication() {
    const { userState } = useUserState()

    const { data: reports, refetch } = usePendingReports()

    const activeReport = useMemo(() => {
        if (!reports || !userState) {
            return null
        }

        const waitingForAdjudicationReports = reports
            .filter((report) =>
                report?.reportorEpochKey
                    ? !isMyEpochKey(
                          userState,
                          report.reportEpoch,
                          report.reportorEpochKey,
                      )
                    : true,
            )
            .filter((report) =>
                report?.respondentEpochKey
                    ? !isMyEpochKey(
                          userState,
                          report.object.epoch,
                          report.respondentEpochKey,
                      )
                    : true,
            )
            .filter(
                (report) =>
                    !report?.adjudicatorsNullifier?.some((adjudicator) =>
                        isMyAdjudicateNullifier(
                            userState,
                            report.reportId,
                            adjudicator.nullifier,
                        ),
                    ),
            )

        if (waitingForAdjudicationReports.length === 0) {
            return null
        }

        return waitingForAdjudicationReports[0]
    }, [reports, userState])

    const reportData = useMemo(() => {
        if (!activeReport) {
            return null
        }

        return {
            id: activeReport.reportId!,
            category: activeReport.category,
            reason: activeReport.reason,
            content: activeReport.object.content,
        }
    }, [activeReport])

    return {
        data: reportData,
        refetch,
    }
}

export default function AdjudicationNotification() {
    const { data: activeAdjudication, refetch } = useActiveAdjudication()

    const [isAdjudicateOpen, toggleAdjudicate] = useToggle(false)
    const [isCancelDialogOpen, toggleCancelDialog] = useToggle(false)

    const onAdjudicateClose = () => {
        refetch()
        toggleAdjudicate(false)
    }

    const onCancelDialogClose = () => {
        toggleCancelDialog(false)
    }

    // if (!activeAdjudication) {
    //     return null
    // }

    const reportData = {
        id: '1',
        content: '123123',
        category: 1,
        reason: "123123123123",
    }

    return (
        <div data-testid="adjudication-notification" className="relative p-2">
            <AdjudicateButton
                onClick={toggleAdjudicate}
                onCancel={toggleCancelDialog}
            />
            <AdjudicateCancelDialog
                reportData={reportData}
                open={isCancelDialogOpen}
                onClose={onCancelDialogClose}
                onOpenAdjudicate={toggleAdjudicate}
            />
            <Adjudicate
                reportData={reportData}
                open={isAdjudicateOpen}
                onClose={onAdjudicateClose}
            />
        </div>
    )
}
