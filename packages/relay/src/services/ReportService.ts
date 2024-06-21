import { DB } from 'anondb'
import { nanoid } from 'nanoid'
import { ReportHistory } from '../types/Report'

export class ReportService {
    async createReport(db: DB, reportData: ReportHistory): Promise<string> {
        const reportId = nanoid()
        await db.create('ReportHistory', {
            reportId,
            type: reportData.type,
            objectId: reportData.objectId,
            reportorEpochKey: reportData.reportorEpochKey,
            reportorClaimedRep: reportData.reportorClaimedRep ?? false,
            respondentEpochKey: reportData.respondentEpochKey,
            respondentClaimedRep: reportData.respondentClaimedRep ?? false,
            reason: reportData.reason,
            adjudicateCount: reportData.adjudicateCount ?? 0,
            adjudicatorsNullifier: reportData.adjudicatorsNullifier,
            status: reportData.status ?? 0,
            category: reportData.category,
            reportEpoch: reportData.reportEpoch,
            reportAt: reportData.reportAt ?? (+new Date()).toString(),
            _id: nanoid(),
        })
        return reportId
    }
}

export const reportService = new ReportService()
