export class NoWalletError extends Error {
    constructor() {
        super()
        this.name = 'NoWalletError'
        this.message =
            '很抱歉通知您，您尚未安裝 MetaMask 錢包，請安裝後返回註冊頁再次嘗試註冊，謝謝您！'
    }
}

export class WalletSignError extends Error {
    constructor() {
        super()
        this.name = 'WalletSignError'
        this.message =
            '很抱歉通知您，MetaMask 錢包產生簽名的時候出現問題，請再次嘗試註冊，謝謝您！'
    }
}

export class SignupFailedError extends Error {
    constructor() {
        super()
        this.name = 'SignupFailedError'
        this.message =
            '很抱歉通知您，您註冊失敗，請返回註冊頁再次嘗試註冊，謝謝您！'
    }
}

export class ServerSignError extends Error {
    constructor() {
        super()
        this.name = 'ServerSignError'
        this.message =
            '很抱歉通知您，伺服器產生簽名的時候出現問題，請再次嘗試註冊，謝謝您！'
    }
}

export class LoginBeforeSignupError extends Error {
    constructor() {
        super()
        this.name = 'LoginBeforeSignupError'
        this.message =
            '很抱歉通知您，您尚未登陸帳號，請返回註冊頁再次嘗試註冊，謝謝您！'
    }
}

export class LoginUnknownError extends Error {
    constructor() {
        super()
        this.name = 'LoginUnknowError'
        this.message =
            '很抱歉通知您，登入時發生未知錯誤，請再次嘗試註冊，謝謝您！'
    }
}

export class YetLoginError extends Error {
    constructor() {
        super()
        this.name = 'YetLoginError'
        this.message =
            '親愛的用戶：您還沒登入 / 註冊唷，請先登入 / 註冊再執行此動作，感謝您！'
    }
}
