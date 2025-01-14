import Joyride, { STATUS, type CallBackProps, type Status } from 'react-joyride'
import { closeTour, useTourStore } from '../../stores/tour'
import TourTooltip from './TourTooltip'

export default function UITour() {
    const { steps, stepIndex, run } = useTourStore()

    const handleCallback = (data: CallBackProps) => {
        const { status } = data

        const finishedStatuses: Status[] = [STATUS.FINISHED, STATUS.SKIPPED]
        if (finishedStatuses.includes(status)) {
            closeTour()
        }
    }

    return (
        <Joyride
            tooltipComponent={TourTooltip}
            steps={steps}
            stepIndex={stepIndex}
            run={run}
            callback={handleCallback}
            continuous
            disableCloseOnEsc
            disableOverlayClose
            disableScrolling
            disableScrollParentFix
            scrollToFirstStep
            showProgress
            floaterProps={{
                hideArrow: true,
            }}
            styles={{
                options: {
                    overlayColor: 'rgba(0, 0, 0, 0.7)',
                },
            }}
        />
    )
}
