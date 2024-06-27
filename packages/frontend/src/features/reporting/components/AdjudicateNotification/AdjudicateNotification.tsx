import { useFetchReports } from '@/features/reporting'
import { useToggle } from '@uidotdev/usehooks'
import { useState } from 'react'
import Adjudicate from '../Adjudicate/Adjudicate'
import { ReportData } from '../Adjudicate/AdjudicateForm'
import AdjudicateButton from './AdjudicateButton'

export default function AdjudicationNotification() {
    const { data } = useFetchReports()

    const [open, toggle] = useToggle(false)

    const [adjudicatingReport, setAdjudicatingReport] = useState<ReportData>()

    function onAdjudicate() {
        if (data?.[0]) {
            toggle(true)
            setAdjudicatingReport(data?.[0])
        }
    }

    if (!data || data.length === 0) {
        return null
    }

    return (
        <div
            className="fixed z-20 right-4 bottom-28 lg:right-10 lg:bottom-20"
            data-testid="adjudication-notification"
        >
            <AdjudicateButton onClick={onAdjudicate} />
            <Adjudicate
                reportData={adjudicatingReport}
                open={open}
                onClose={() => toggle(false)}
            />
        </div>
    )
}
