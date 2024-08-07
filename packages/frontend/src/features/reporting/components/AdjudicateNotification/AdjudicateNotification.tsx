import { useUserState } from '@/features/core'
import { isMyEpochKey } from '@/utils/helpers/epochKey'
import { useToggle } from '@uidotdev/usehooks'
import { useMemo } from 'react'
import { usePendingReports } from '../../hooks/usePendingReports/usePendingReports'
import { isMyAdjudicateNullifier } from '../../utils/helpers'
import Adjudicate from '../Adjudicate/Adjudicate'
import AdjudicateButton from './AdjudicateButton'

function useActiveAdjudication() {
    const { userState } = useUserState()

    const { data: reports } = usePendingReports()

    const activeReport = useMemo(() => {
        if (!reports || !userState) {
            return null
        }

        const waitingForAdjudicationReports = reports
            .filter((report) =>
                report?.reportorEpochKey
                    ? !isMyEpochKey(userState, report.reportorEpochKey)
                    : true,
            )
            .filter((report) =>
                report?.respondentEpochKey
                    ? !isMyEpochKey(userState, report.respondentEpochKey)
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

    return useMemo(() => {
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
}

export default function AdjudicationNotification() {
    const activeAdjudication = useActiveAdjudication()

    const [open, toggle] = useToggle(false)

    if (!activeAdjudication) {
        return null
    }

    return (
        <div data-testid="adjudication-notification">
            <AdjudicateButton onClick={toggle} />
            <Adjudicate
                reportData={activeAdjudication}
                open={open}
                onClose={() => toggle(false)}
            />
        </div>
    )
}
