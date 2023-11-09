const LOCAL_STORAGE = {
    IS_VERIFIED_BY_TWITTER: 'isVerifiedByTwitter',
    HASH_USER_ID: 'hashUserId',
    SIGNATURE: 'signature',
    ACCESS_TOKEN: 'token',
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
        localStorage.setItem(LOCAL_STORAGE.HASH_USER_ID, hashUserId)
    }

    static setSignature(signature: string) {
        localStorage.setItem(LOCAL_STORAGE.SIGNATURE, signature)
    }

    static setAccessToken(accessToken: string) {
        localStorage.setItem(LOCAL_STORAGE.ACCESS_TOKEN, accessToken)
    }

    static getGuaranteedHashUserId() {
        const hashUserId = localStorage.getItem(LOCAL_STORAGE.HASH_USER_ID)
        if (!hashUserId) {
            throw new Error('Hash user id does not exist')
        }
        return hashUserId
    }

    static getGuaranteedSignature() {
        const signature = localStorage.getItem(LOCAL_STORAGE.SIGNATURE)
        if (!signature) {
            throw new Error('Signature does not exist')
        }
        return signature
    }

    static getGuaranteedAccessToken() {
        const accessToken = localStorage.getItem(LOCAL_STORAGE.ACCESS_TOKEN)
        if (!accessToken) {
            throw new Error('Access token does not exist')
        }
        return accessToken
    }
}
