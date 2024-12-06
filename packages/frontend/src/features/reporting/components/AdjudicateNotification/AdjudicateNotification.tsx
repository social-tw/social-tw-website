import { useUserState } from '@/features/core'
import { isMyEpochKey } from '@/utils/helpers/epochKey'
import { useEffect, useMemo } from 'react'
import { usePendingReports } from '../../hooks/usePendingReports/usePendingReports'
import { isMyAdjudicateNullifier } from '../../utils/helpers'
import Adjudicate from '../Adjudicate/Adjudicate'
import AdjudicateButton from './AdjudicateButton'
import { useAdjudicateStore } from '../../hooks/useAdjudicate/useAdjudicateStore'
import { useSendNotification } from '@/features/notification/stores/useNotificationStore'
import { NotificationType } from '@/types/Notifications'

function useActiveAdjudication() {
    const { userState } = useUserState()

    const { data: reports, refetch } = usePendingReports()
    const sendNotification = useSendNotification()
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

    useEffect(() => {
        if (activeReport) {
            sendNotification(NotificationType.NEW_REPORT_ADJUDICATE)
        }
    }, [activeReport])

    return {
        data: reportData,
        refetch,
    }
}

export default function AdjudicationNotification() {
    const { data: activeAdjudication, refetch } = useActiveAdjudication()
    const { AdjuducateDialogOpen, setAdjuducateDialogOpen } =
        useAdjudicateStore()

    const onClose = () => {
        refetch() // Refetch data when closing the dialog if needed
        setAdjuducateDialogOpen(false) // Close the dialog
    }

    if (!activeAdjudication) {
        return null
    }

    return (
        <div data-testid="adjudication-notification">
            <AdjudicateButton onClick={() => setAdjuducateDialogOpen(true)} />
            <Adjudicate
                reportData={activeAdjudication}
                open={AdjuducateDialogOpen}
                onClose={onClose}
            />
        </div>
    )
}
