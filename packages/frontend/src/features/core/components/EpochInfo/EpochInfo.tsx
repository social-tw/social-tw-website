import EpochImg from '@/assets/img/epoch.png'
import { useActionCount, useEpoch } from '@/features/core'
import clsx from 'clsx'
import Countdown from 'react-countdown'
import { FaRegQuestionCircle } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'

function EpochTimer({ onClick }: { onClick: () => void }) {
    const { epochEndTime } = useEpoch()

    return (
        <div>
            <div className="flex justify-between gap-2">
                <p className="text-xs font-semibold text-white text-nowrap">
                    當前 Epoch 倒數
                </p>
                <FaRegQuestionCircle
                    className="text-white cursor-pointer w-3 h-3"
                    onClick={onClick}
                />
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

function getAccountCountMessage(count: number) {
    if (count > 5) {
        return '強烈建議等下個Epoch後執行動作，以免身份洩漏'
    } else if (count > 3) {
        return '動作次數超出安全範圍，建議等下個Epoch後執行'
    } else {
        return '目前動作次數(3次內)可確保匿名身份不被交叉比對'
    }
}

function EpochMessage() {
    const count = useActionCount()
    const message = getAccountCountMessage(count)

    return <p className="text-xs font-medium text-white/60">{message}</p>
}

export default function EpochInfo() {
    const navigate = useNavigate()

    const gotoAboutPage = () => {
        navigate('/about')
    }

    return (
        <div className="flex items-stretch gap-3">
            <img
                className="w-16 h-16 basis-16 shrink-0"
                src={EpochImg}
                alt="epoch actions"
            />
            <div className="flex-1 space-y-1">
                <div className="flex gap-2">
                    <EpochTimer onClick={gotoAboutPage} />
                    <div className="flex-1">
                        <EpochActionCounter />
                    </div>
                </div>
                <div className="flex justify-between gap-2">
                    <EpochMessage />
                    <FaRegQuestionCircle
                        className="text-white cursor-pointer w-3 h-3"
                        onClick={gotoAboutPage}
                    />
                </div>
            </div>
        </div>
    )
}
