const ERROR_MESSAGES: Record<string, { code: string; message: string }> = {
    SIGNUP_FAILED: {
        code: 'SIGNUP_FAILED',
        message: '很抱歉通知您，您註冊失敗，請返回註冊頁再次嘗試註冊，謝謝您！',
    },
    LOGIN_BEFORE_SIGNUP: {
        code: 'LOGIN_BEFORE_SIGNUP',
        message:
            '很抱歉通知您，您尚未登陸帳號，請返回註冊頁再次嘗試註冊，謝謝您！',
    },
    NO_WALLET: {
        code: 'NO_WALLET',
        message:
            '很抱歉通知您，您尚未安裝 MetaMask 錢包，請安裝後返回註冊頁再次嘗試註冊，謝謝您！',
    },
    WALLET_ISSUE: {
        code: 'WALLET_ISSUE',
        message:
            '很抱歉通知您，MetaMask 錢包產生簽名的時候出現問題，請再次嘗試註冊，謝謝您！',
    },
    SERVER_ISSUE: {
        code: 'SERVER_ISSUE',
        message:
            '很抱歉通知您，伺服器產生簽名的時候出現問題，請再次嘗試註冊，謝謝您！',
    },
    MISSING_ELEMENT: {
        code: 'MISSING_ELEMENT',
        message: '很抱歉通知您，登入時發生未知錯誤，請再次嘗試註冊，謝謝您！',
    },
    ACTION_WITHOUT_LOGIN: {
        code: 'ACTION_WITHOUT_LOGIN',
        message:
            '親愛的用戶：您還沒登入 / 註冊唷，請先登入 / 註冊再執行此動作，感謝您！',
    },
    UNSUPPORTED_VOTE_TYPE: {
        code: 'UNSUPPORTED_VOTE_TYPE',
        message: 'Unsupported Vote Type Detected',
    },
}

export default ERROR_MESSAGES
