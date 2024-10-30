import { useUserState } from '@/features/core'
import { isMyEpochKey } from '@/utils/helpers/epochKey'
import { useToggle } from '@uidotdev/usehooks'
import { useMemo } from 'react'
import { useState, useEffect } from 'react'
import { usePendingReports } from '../../hooks/usePendingReports/usePendingReports'
import { isMyAdjudicateNullifier } from '../../utils/helpers'
import Adjudicate from '../Adjudicate/Adjudicate'
import AdjudicateButton from './AdjudicateButton'
import ConfirmationDialog from './ConfirmationDialog'

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
    const [open, toggle] = useToggle(false)
    const [confirmOpen, setConfirmOpen] = useState(false)
    const [buttonVisible, setButtonVisible] = useState(true)

    useEffect(() => {
        if (activeAdjudication) {
            setButtonVisible(true)
        }
    }, [activeAdjudication])

    const closeAdjudicate = () => {
        toggle(false)
    }

    const closeConfirm = () => {
        setConfirmOpen(false)
    }

    const handleCloseClick = () => {
        setConfirmOpen(true)
    }

    const goAdjudicate = () => {
        toggle(true)
        setButtonVisible(false)
        setConfirmOpen(false)
    }

    const confirmClose = () => {
        toggle(false)
        setConfirmOpen(false)
        setButtonVisible(false)
        refetch()
    }

    if (!activeAdjudication) {
        return null
    }

    return (
        <div data-testid="adjudication-notification">
            {buttonVisible && (
                <AdjudicateButton
                    onClick={goAdjudicate}
                    onClose={handleCloseClick}
                />
            )}
            <ConfirmationDialog
                open={confirmOpen}
                onConfirm={confirmClose}
                onCancel={goAdjudicate}
                onClose={closeConfirm}
            />
            <Adjudicate
                reportData={activeAdjudication}
                open={open}
                onClose={closeAdjudicate}
            />
        </div>
    )
}
