import { ReactComponent as LongArrowLeftIcon } from '@/assets/svg/long-arrow-left.svg'
import { ReactComponent as LongArrowRightIcon } from '@/assets/svg/long-arrow-right.svg'
import { jumpStep, nextStep, prevStep, useTourStore } from '../../stores/tour'

export default function TourPagination() {
    const { steps, stepIndex } = useTourStore()

    const isFirstStep = stepIndex === 0
    const isLastStep = stepIndex === steps.length - 1

    return (
        <div className="flex gap-3">
            <button
                className="flex-1 h-2 text-content disabled:text-content/30"
                disabled={isFirstStep}
                onClick={prevStep}
            >
                <LongArrowLeftIcon />
            </button>
            {[1, 2, 3, 4, 5, 6].map((_, index) => (
                <button
                    key={index}
                    className="flex-1 h-2 bg-white data-[active=true]:bg-primary"
                    data-active={stepIndex === index}
                    onClick={() => jumpStep(index)}
                />
            ))}
            <button
                className="flex-1 h-2 text-content disabled:text-content/30"
                disabled={isLastStep}
                onClick={nextStep}
            >
                <LongArrowRightIcon />
            </button>
        </div>
    )
}
