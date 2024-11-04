import { useEpoch } from '@/features/core'
import Countdown from 'react-countdown'

export default function EpochTimer() {
    const { epochEndTime } = useEpoch()

    return (
        <div className="space-y-1">
            <div className="text-xs font-semibold text-white">
                Next Epoch in
            </div>
            <div className="text-3xl font-semibold leading-6 text-white">
                {epochEndTime && (
                    <Countdown
                        key={epochEndTime}
                        date={epochEndTime}
                        renderer={(props) =>
                            `${props.formatted.minutes}:${props.formatted.seconds}`
                        }
                    />
                )}
            </div>
        </div>
    )
}