import ReputationHistory from '@/features/profile/components/ReputationHistory/ReputationHistory'
import { useReputationScore } from '@/features/reporting'
import { Link } from 'react-router-dom'

function Hint() {
    return (
        <div className="p-4 text-sm leading-6 text-black bg-white lg:p-6 rounded-xl">
            聲譽分數（Reputation Score）為用戶在 Unirep Social Taiwan
            上的所有操作行為所獲得的分數，作為去中心化與用戶自治的機制。每位用戶的聲譽分數起始分數為
            0，當用戶的分數為負分時，平台將限制該用戶的操作行為，該用戶無法進行發文、按讚、倒讚、留言、檢舉和協助檢舉評判，僅能進行瀏覽。更多詳情請參閱
            <Link className="underline text-secondary" to="/about">
                平台說明
            </Link>
        </div>
    )
}

function Score() {
    const { reputationScore } = useReputationScore()
    const myScore = reputationScore || 0
    const myScoreStyle = getScoreStyle(myScore)
    const hint = getHintByScore(myScore)
    const subHint = '＊聲譽分數會在每個 Epoch 開始時更新'
    return (
        <div>
            <div className={myScoreStyle}>{myScore}</div>
            <div className="mt-2 text-sm text-center text-white">{hint}</div>
            <div className="mt-1 text-xs text-center text-gray-400">
                {subHint}
            </div>
        </div>
    )
}

function getHintByScore(score: number) {
    return checkIsMyScoreNegative(score)
        ? '您的聲譽分數為負值，行為權力已被限制'
        : '您的聲譽分數良好，不會被限制行為權利'
}

function getScoreStyle(score: number) {
    const isMyScoreNegative = checkIsMyScoreNegative(score)
    const textColor = isMyScoreNegative ? 'text-red-600' : 'text-white'
    return `text-center ${textColor} text-7xl`
}

function checkIsMyScoreNegative(score: number) {
    return score < 0
}

export default function Reputation() {
    return (
        <div className="px-4 py-8 space-y-8 lg:px-0">
            <Score />
            <Hint />
            <ReputationHistory />
        </div>
    )
}
