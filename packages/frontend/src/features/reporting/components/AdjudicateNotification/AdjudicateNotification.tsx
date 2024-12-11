import { useAuthStatus } from '@/features/auth'
import { useUserState } from '@/features/core'
import { useSendNotification } from '@/features/notification/stores/useNotificationStore'
import { NotificationType } from '@/types/Notifications'
import { isMyEpochKey } from '@/utils/helpers/epochKey'
import { useEffect, useMemo } from 'react'
import { usePendingReports } from '@/features/reporting'
import { isMyAdjudicateNullifier } from '../../utils/helpers'
import AdjudicateFlow from '../Adjudicate/AdjudicateFlow';

export default function AdjudicationNotification() {
    const { isLoggedIn } = useAuthStatus();
    const { userState } = useUserState();
    const { data: reports, refetch } = usePendingReports();
    const sendNotification = useSendNotification();

    const activeReport = useMemo(() => {
        if (!reports || !userState) {
            return null;
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
            );

        if (waitingForAdjudicationReports.length === 0) {
            return null;
        }

        return waitingForAdjudicationReports[0];
    }, [reports, userState]);

    const reportData = useMemo(() => {
        if (!activeReport) {
            return undefined;
        }

        return {
            id: activeReport.reportId!,
            category: activeReport.category,
            reason: activeReport.reason,
            content: activeReport.object.content,
        };
    }, [activeReport]);

    useEffect(() => {
        if (activeReport) {
            sendNotification(NotificationType.NEW_REPORT_ADJUDICATE);
        }
    }, [activeReport, sendNotification]);

    if (!isLoggedIn) {
        return null;
    }

    return (
        <div data-testid="adjudication-notification">
            <AdjudicateFlow
                reportData={reportData}
                onRefetch={refetch}
            />
        </div>
    );
}