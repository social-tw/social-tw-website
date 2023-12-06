export const Score = () => {
    const myScore = -1
    const myScoreStyle = getScoreStyle(myScore)
    const hint = getHintByScore(myScore)
    return (
        <div>
            <hr className="border-gray-600 mb-8" />
            <div className={myScoreStyle}>{myScore}</div>
            <div className="text-center mt-4 text-sm">{hint}</div>
            <hr className="border-gray-600 mb-8 mt-8" />
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
