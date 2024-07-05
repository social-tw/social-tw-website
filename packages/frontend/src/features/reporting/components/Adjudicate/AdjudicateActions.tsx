import { useCounter, useHarmonicIntervalFn } from 'react-use'

export default function AdjudicateActions({
    onAgree = () => {},
    onDisagree = () => {},
}: {
    onAgree?: () => void
    onDisagree?: () => void
}) {
    const [count, { dec }] = useCounter(10)

    useHarmonicIntervalFn(
        () => {
            if (count > 0) {
                dec()
            }
        },
        count === 0 ? null : 1000,
    )

    const isReady = count === 0
    const message = isReady ? '已可進行評判' : `${count}秒後即可進行評判`

    return (
        <>
            <p className="mb-1 text-xs text-right text-neutral-600">
                {message}
            </p>
            <div className="flex gap-4">
                <button
                    className="flex-1 text-lg font-bold text-white btn btn-primary"
                    disabled={!isReady}
                    onClick={onAgree}
                >
                    同意檢舉
                </button>
                <button
                    className="flex-1 text-lg font-bold text-white btn btn-secondary"
                    disabled={!isReady}
                    onClick={onDisagree}
                >
                    否決檢舉
                </button>
            </div>
        </>
    )
}
