import clsx from 'clsx'
import Countdown from 'react-countdown'
import EpochImg from '@/assets/img/epoch.png'
import { useActionCount, useEpoch } from '@/features/core'

function EpochTimer() {
    const { epochEndTime } = useEpoch()

    return (
        <div>
            <div className="text-xs font-semibold text-white">
                Next Epoch in
            </div>
            <div
                className="text-3xl font-semibold text-white h-9"
                data-testid="epoch-remaining-time"
            >
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

function getCounterColor(index: number, count: number) {
    if (index < count) {
        if (index > 4) {
            return 'bg-error'
        } else if (index > 2) {
            return 'bg-primary'
        } else {
            return 'bg-secondary'
        }
    } else {
        return 'bg-[#d9d9d9]'
    }
}

function EpochActionCounter() {
    const count = useActionCount()

    return (
        <div className="flex h-full gap-2" data-testid="action-counter">
            {new Array(7).fill(0).map((_, index) => (
                <div
                    key={index}
                    className={clsx('flex-1', getCounterColor(index, count))}
                />
            ))}
        </div>
    )
}

function getAcountCountMessage(count: number) {
    if (count > 5) {
        return '強烈建議等下個Epoch後執行動作，以免身份洩漏'
    } else if (count > 3) {
        return '動作次數超出安全範圍，建議等下個Epoch後執行'
    } else {
        return '目前動作次數(3次內)可確保匿名身份不被洩漏'
    }
}

function EpochMessage() {
    const count = useActionCount()
    const message = getAcountCountMessage(count)

    return <p className="text-xs font-medium text-white/60">{message}</p>
}

export default function EpochInfo() {
    return (
        <div className="flex items-stretch gap-3">
            <img
                className="w-14 h-14 basis-14 shrink-0"
                src={EpochImg}
                alt="epoch actions"
            />
            <div className="flex-1 space-y-1">
                <div className="flex gap-2">
                    <div className="w-[90px] basis-[90px]">
                        <EpochTimer />
                    </div>
                    <div className="flex-1">
                        <EpochActionCounter />
                    </div>
                </div>
                <EpochMessage />
            </div>
        </div>
    )
}
