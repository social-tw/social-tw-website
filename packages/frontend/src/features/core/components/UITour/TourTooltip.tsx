import { ReactComponent as CloseIcon } from '@/assets/svg/close.svg'
import { SignupProgress, useAuthStatus } from '@/features/auth'
import { type TooltipRenderProps } from 'react-joyride'
import { closeTour, resetTour } from '../../stores/tour'
import TourPagination from './TourPagination'

function StepTitle({ children }: { children: React.ReactNode }) {
    return (
        <h1 className="mb-2 text-xl font-bold tracking-wide text-center text-content">
            {children}
        </h1>
    )
}

function StepParagraph({ children }: { children: React.ReactNode }) {
    return (
        <p className="text-sm tracking-wide text-left text-content">
            {children}
        </p>
    )
}

export default function TourTooltip(props: TooltipRenderProps) {
    const { index, step, tooltipProps, isLastStep } = props

    const { isSignedUp } = useAuthStatus()

    return (
        <article
            {...tooltipProps}
            className="relative border-2 border-white max-w-85 bg-white/90 rounded-xl"
        >
            <div className="absolute -top-2 -left-2">
                <span className="flex items-center justify-center text-lg font-bold text-white rounded-full w-7 h-7 bg-primary">
                    {index + 1}
                </span>
            </div>
            {isSignedUp && (
                <div className="absolute top-2 right-2">
                    <button onClick={closeTour}>
                        <CloseIcon />
                    </button>
                </div>
            )}
            <div className="px-4 py-8 space-y-6">
                <section>
                    {step.title && <StepTitle>{step.title}</StepTitle>}
                    <StepParagraph>{step.content}</StepParagraph>
                </section>
                <section>
                    <TourPagination />
                </section>
                <section>
                    {isSignedUp && isLastStep ? (
                        <button
                            className="flex items-center justify-center px-4 py-2 mx-auto text-base font-bold text-white rounded-full h-9 bg-secondary"
                            onClick={resetTour}
                        >
                            都瞭解了，開始探索！
                        </button>
                    ) : (
                        <SignupProgress />
                    )}
                </section>
            </div>
        </article>
    )
}
