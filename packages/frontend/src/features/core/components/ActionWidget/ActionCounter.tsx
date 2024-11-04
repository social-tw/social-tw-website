import { useActionCount } from '@/features/core'
import clsx from 'clsx'

export default function ActionCounter() {
    const count = useActionCount()

    return (
        <div className="flex h-full gap-2">
            {new Array(7).fill(0).map((_, index) => (
                <div
                    key={index}
                    className={clsx('flex-1', getCounterColor(index, count))}
                />
            ))}
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