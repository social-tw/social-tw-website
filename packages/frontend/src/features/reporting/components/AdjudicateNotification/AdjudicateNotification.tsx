import { QueryKeys } from '@/constants/queryKeys'
import { useUserState } from '@/features/core'
import { fetchSinglePost } from '@/utils/api'
import { isMyEpochKey } from '@/utils/helpers/epochKey'
import { useQuery } from '@tanstack/react-query'
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

    const { data: reportedObject } = useQuery({
        queryKey: [QueryKeys.SinglePost, activeReport?.objectId],
        queryFn: async () => {
            if (!activeReport?.objectId) {
                return null
            }
            return fetchSinglePost(activeReport.objectId)
        },
    })

    return useMemo(() => {
        if (!activeReport || !reportedObject) {
            return null
        }

        return {
            id: activeReport.reportId!,
            category: activeReport.category,
            reason: activeReport.reason,
            content: reportedObject.content,
        }
    }, [activeReport, reportedObject])
}

export default function AdjudicationNotification() {
    const activeAdjudication = useActiveAdjudication()

    const [open, toggle] = useToggle(false)

    if (!activeAdjudication) {
        return null
    }

    return (
        <div
            className="fixed z-20 right-4 bottom-28 lg:right-10 lg:bottom-20"
            data-testid="adjudication-notification"
        >
            <AdjudicateButton onClick={toggle} />
            <Adjudicate
                reportData={activeAdjudication}
                open={open}
                onClose={() => toggle(false)}
            />
        </div>
    )
}
