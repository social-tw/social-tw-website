import { PATHS } from '@/constants/paths'
import { useEpoch } from '@/features/core'
import Countdown from 'react-countdown'
import { AiOutlineQuestionCircle } from 'react-icons/ai'
import { Link } from 'react-router-dom'

export default function EpochTimer() {
    const { epochEndTime } = useEpoch()

    return (
        <div className="space-y-1">
            <div className="flex items-start gap-1 text-xs font-semibold text-white">
                當前 Epoch 倒數
                <Link to={`${PATHS.ABOUT_US}?viewId=feature-epoch`}>
                    <AiOutlineQuestionCircle size={12} />
                </Link>
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
