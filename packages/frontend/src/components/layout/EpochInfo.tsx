/* eslint-disable react/prop-types */
import clsx from 'clsx'
import Countdown from 'react-countdown'
import EpochImg from '@/assets/epoch.png'
import useActionCount from '@/hooks/useActionCount'
import useEpoch from '@/hooks/useEpoch'

export default function EpochInfo() {
    const { epochEndTime } = useEpoch()

    const count = useActionCount()

    const countColors = [
        'bg-secondary',
        'bg-secondary',
        'bg-secondary',
        'bg-primary',
        'bg-primary',
        'bg-error',
        'bg-error',
    ]

    return (
        <div className="flex items-stretch gap-3">
            <img
                className="w-14 h-14 basis-14 shrink-0"
                src={EpochImg}
                alt="epoch"
            />
            <div className="flex-1 space-y-1">
                <div className="flex gap-2">
                    <div className="w-[90px] basis-[90px]">
                        <span className="block text-xs font-semibold text-white">
                            Next Epoch in{' '}
                        </span>
                        <span
                            className="block text-3xl font-semibold text-white h-9"
                            data-testid="epoch-remaining-time"
                        >
                            {epochEndTime && (
                                <Countdown
                                    key={epochEndTime * 1000}
                                    date={epochEndTime * 1000}
                                    renderer={(props) =>
                                        `${props.formatted.minutes}:${props.formatted.seconds}`
                                    }
                                />
                            )}
                        </span>
                    </div>
                    <div
                        className="flex flex-1 gap-2"
                        data-testid="action-counter"
                    >
                        {new Array(7).fill(0).map((_, index) => (
                            <div
                                key={index}
                                className={clsx(
                                    'flex-1',
                                    index < count
                                        ? countColors[index]
                                        : 'bg-[#d9d9d9]',
                                )}
                            />
                        ))}
                    </div>
                </div>
                <p className="text-xs font-medium text-white/60">
                    目前動作次數(3次內)可確保匿名身份不被洩漏
                </p>
            </div>
        </div>
    )
}
