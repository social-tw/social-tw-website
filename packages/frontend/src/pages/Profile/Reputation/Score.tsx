export const Score = () => {
    const myScore = 0
    const hint = getHint()
    return (
        <div>
            <hr className="border-gray-600 mb-8" />
            <div className="text-center text-white text-9xl">{myScore}</div>
            <div className="text-center mt-4 text-sm">{hint}</div>
            <hr className="border-gray-600 mb-8 mt-8" />
        </div>
    )
}

function getHint() {
    return '您的 Reputation 分數良好，不會被限制行為權利'
}
