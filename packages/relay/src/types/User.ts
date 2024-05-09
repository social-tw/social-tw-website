export type User = {
    hashUserId: string
    status: number
    signMsg: string | undefined
    token: string | undefined
}

export enum UserRegisterStatus {
    NOT_REGISTER,
    INIT,
    REGISTERER,
    REGISTERER_SERVER,
}