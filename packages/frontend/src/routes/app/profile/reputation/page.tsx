import { LoginButton, useAuthStatus } from '@/features/auth'
import ReputationHistory from '@/features/profile/components/ReputationHistory/ReputationHistory'
import { useReputationScore } from '@/features/reporting'
import { RiLoginBoxLine } from 'react-icons/ri'
import { useNavigate } from 'react-router-dom'

const CONTENT =
    '為維護匿名平台的抗審查及自治特性，Reputation 代表著您在此平台上的信用分數，每位用戶在註冊時的分數都為０，當分數為負數時，平台將限制您的行為使您無法發文、留言、投票，若希望提高分數，請參閱平台政策。此分數受您的在平台上的行為所影響，若您受到他人檢舉，並且檢舉被判斷為有效時，您將會被扣分；若您檢舉他人成功、或是幫助平台裁定檢舉，您將會被加分。平台方保有最終解釋權'

function Hint() {
    return (
        <div className={`bg-white text-black p-8 rounded-xl leading-8`}>
            {CONTENT}
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
            <hr className="mb-8 border-gray-600" />
            <div className={myScoreStyle}>{myScore}</div>
            <div className="mt-4 text-sm text-center text-white">{hint}</div>
            <div className="mt-4 text-[12px] text-center text-gray-400">
                {subHint}
            </div>
            <hr className="mt-8 mb-8 border-gray-600" />
        </div>
    )
}

function getHintByScore(score: number) {
    return checkIsMyScoreNegative(score)
        ? '您的 Reputation 分數為負值，行為權力已被限制'
        : '您的 Reputation 分數良好，不會被限制行為權利'
}

function getScoreStyle(score: number) {
    const isMyScoreNegative = checkIsMyScoreNegative(score)
    const textColor = isMyScoreNegative ? 'text-red-600' : 'text-white'
    return `text-center ${textColor} text-9xl`
}

function checkIsMyScoreNegative(score: number) {
    return score < 0
}

export default function Reputation() {
    const { isLoggedIn } = useAuthStatus()
    const navigate = useNavigate()

    const handleClick = () => {
        navigate('/welcome')
    }

    return (
        <div>
            {isLoggedIn ? (
                <>
                    <Score />
                    <ReputationHistory />
                    <Hint />
                </>
            ) : (
                <LoginButton
                    isLoading={false}
                    onClick={handleClick}
                    title="登入你的帳號"
                    color="#2F9CAF"
                    icon={RiLoginBoxLine}
                    text="lg"
                    iconSize={24}
                />
            )}
        </div>
    )
}
