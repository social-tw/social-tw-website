import { useAuthStatus } from '@/features/auth'
import { useUserState } from '@/features/core'
import { useSendNotification } from '@/features/notification/stores/useNotificationStore'
import { NotificationType } from '@/types/Notifications'
import { isMyEpochKey } from '@/utils/helpers/epochKey'
import { useToggle } from '@uidotdev/usehooks'
import { useEffect, useMemo, useState } from 'react'
import { usePendingReports } from '../../hooks/usePendingReports/usePendingReports'
import { isMyAdjudicateNullifier } from '../../utils/helpers'
import Adjudicate from '../Adjudicate/Adjudicate'
import AdjudicateButton from './AdjudicateButton'
import ConfirmationDialog from './ConfirmationDialog'

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
            sendNotification(
                NotificationType.NEW_REPORT_ADJUDICATE,
                undefined,
                activeReport.reportId,
            )
        }
    }, [activeReport, sendNotification])

    return {
        data: reportData,
        refetch,
    }
}

export default function AdjudicationNotification() {
    const { isLoggedIn } = useAuthStatus()
    const { data: activeAdjudication, refetch } = useActiveAdjudication()
    const [open, toggle] = useToggle(false)
    const [confirmOpen, setConfirmOpen] = useState(false)
    const [buttonVisible, setButtonVisible] = useState(true)

    useEffect(() => {
        if (activeAdjudication) {
            setButtonVisible(true)
        }
    }, [activeAdjudication])

    const closeAdjudication = () => {
        setButtonVisible(true)
        toggle(false)
    }

    const closeConfirmation = () => {
        setConfirmOpen(false)
    }

    const openConfirmation = () => {
        setConfirmOpen(true)
    }

    const openAdjudication = () => {
        toggle(true)
        setButtonVisible(false)
        setConfirmOpen(false)
    }

    const rejectAdjudication = () => {
        toggle(false)
        setConfirmOpen(false)
        setButtonVisible(false)
        refetch()
    }

    if (!activeAdjudication || !isLoggedIn) {
        return null
    }

    return (
        <div data-testid="adjudication-notification">
            {buttonVisible && (
                <AdjudicateButton
                    onClick={openAdjudication}
                    onClose={openConfirmation}
                />
            )}
            <ConfirmationDialog
                open={confirmOpen}
                onConfirm={rejectAdjudication}
                onCancel={openAdjudication}
                onClose={closeConfirmation}
            />
            <Adjudicate
                reportData={activeAdjudication}
                open={open}
                onClose={closeAdjudication}
            />
        </div>
    )
}
