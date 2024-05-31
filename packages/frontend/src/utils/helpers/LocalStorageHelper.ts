export const LOCAL_STORAGE = {
    IS_VERIFIED_BY_TWITTER: 'isVerifiedByTwitter',
    ACCESS_TOKEN: 'token',
    HASH_USER_ID: 'hashUserId',
    SIGN_MSG: 'signMsg',
    SIGNATURE: 'signature',
}

export class LocalStorageHelper {
    static setIsTwitterVerified() {
        localStorage.setItem(LOCAL_STORAGE.IS_VERIFIED_BY_TWITTER, 'true')
    }

    static removeIsTwitterVerified() {
        localStorage.removeItem(LOCAL_STORAGE.IS_VERIFIED_BY_TWITTER)
    }

    static getIsVerifiedByTwitter() {
        return (
            localStorage.getItem(LOCAL_STORAGE.IS_VERIFIED_BY_TWITTER) ===
            'true'
        )
    }

    static setHashUserId(hashUserId: string) {
        localStorage.setItem(
            LOCAL_STORAGE.HASH_USER_ID,
            JSON.stringify(hashUserId),
        )
    }

    static removeHashUserId() {
        localStorage.removeItem(LOCAL_STORAGE.HASH_USER_ID)
    }

    static setSignMsg(signMsg: string) {
        localStorage.setItem(LOCAL_STORAGE.SIGN_MSG, JSON.stringify(signMsg))
    }

    static removeSignMsg() {
        localStorage.removeItem(LOCAL_STORAGE.SIGN_MSG)
    }

    static setSignature(signature: string) {
        localStorage.setItem(LOCAL_STORAGE.SIGNATURE, JSON.stringify(signature))
    }

    static removeSignature() {
        localStorage.removeItem(LOCAL_STORAGE.SIGNATURE)
    }

    static setAccessToken(accessToken: string) {
        localStorage.setItem(
            LOCAL_STORAGE.ACCESS_TOKEN,
            JSON.stringify(accessToken),
        )
    }

    static removeAccessToken() {
        localStorage.removeItem(LOCAL_STORAGE.ACCESS_TOKEN)
    }

    static getGuaranteedHashUserId() {
        const hashUserId = localStorage.getItem(LOCAL_STORAGE.HASH_USER_ID)
        if (!hashUserId) {
            throw new Error('Hash user id does not exist')
        }
        return JSON.parse(hashUserId)
    }

    static getGuaranteedSignMsg() {
        const signMsg = localStorage.getItem(LOCAL_STORAGE.SIGN_MSG)
        if (!signMsg) {
            throw new Error('SignMsg does not exist')
        }
        return JSON.parse(signMsg)
    }

    static getGuaranteedSignature() {
        const signature = localStorage.getItem(LOCAL_STORAGE.SIGNATURE)
        if (!signature) {
            throw new Error('Signature does not exist')
        }
        return JSON.parse(signature)
    }

    static getGuaranteedAccessToken() {
        const accessToken = localStorage.getItem(LOCAL_STORAGE.ACCESS_TOKEN)
        if (!accessToken) {
            throw new Error('Access token does not exist')
        }
        return JSON.parse(accessToken)
    }
}
