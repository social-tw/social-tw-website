import clsx from "clsx";
import { useEffect, useMemo, useState } from "react";
import Countdown from "react-countdown";
import EpochImg from "@/assets/epoch.png";
import { countByTimeRangeSelector, useActionStore } from "@/contexts/Actions";
import useEpoch from "@/hooks/useEpoch";

export default function EpochInfo() {
    const { epochLength, remainingTime, epoch } = useEpoch()

    const startTime = useMemo(
        () =>
            epoch && remainingTime
                ? Date.now() - (epochLength - remainingTime) * 1000
                : 0,
        [epoch, epochLength, remainingTime]
    )
    const endTime = useMemo(
        () => (epoch && remainingTime ? Date.now() + remainingTime * 1000 : 0),
        [epoch, epochLength, remainingTime]
    )

    const [nextEpochTime, setNextEpochTime] = useState<number>()
    useEffect(() => {
        if (remainingTime) {
            setNextEpochTime(Date.now() + remainingTime * 1000)
        }
    }, [remainingTime])

    const count = useActionStore(countByTimeRangeSelector(startTime, endTime))

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
                alt='epoch'
            />
            <div className="flex-1 space-y-1">
                <div className="flex gap-2">
                    <div>
                        <span className="block text-xs font-semibold text-white">
                            Next Epoch in{' '}
                        </span>
                        <span
                            className="block text-3xl font-semibold text-white h-9"
                            data-testid="epoch-remaining-time"
                        >
                            {nextEpochTime && (
                                <Countdown
                                    date={nextEpochTime}
                                    renderer={(props) =>
                                        `${props.formatted.minutes}:${props.formatted.seconds}`
                                    }
                                    onComplete={() =>
                                        setNextEpochTime(
                                            Date.now() + epochLength
                                        )
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
                                        : 'bg-[#d9d9d9]'
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
