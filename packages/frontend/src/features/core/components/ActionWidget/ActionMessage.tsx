import { useActionCount } from '@/features/core'

export default function ActionMessage() {
    const count = useActionCount()
    const message = getAccountCountMessage(count)

    return (
        <span className="inline-block text-xs font-medium text-white/60">
            {message}
        </span>
    )
}

function getAccountCountMessage(count: number) {
    if (count > 5) {
        return '強烈建議等下個Epoch後執行動作，以免身份洩漏'
    } else if (count > 3) {
        return '動作次數超出安全範圍，建議等下個Epoch後執行'
    } else {
        return '目前動作次數3次內，可確保匿名身份不被交叉比對'
    }
}
