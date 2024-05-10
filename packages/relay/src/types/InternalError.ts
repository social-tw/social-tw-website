export class InternalError extends Error {
    httpStatusCode: number

    constructor(message?: string, httpStatusCode: number = 500) {
        super(message) // Pass the message to the Error constructor
        this.httpStatusCode = httpStatusCode
    }
}

// user related error
export const InvalidHashUserIdError = new InternalError(
    'Invalid hashUserId',
    400
)
export const UserAlreadySignedUpError = new InternalError(
    'The user has already signed up.',
    400
)
export const UserLoginError = new InternalError('Error in login', 400)

// general error
export const InvalidEpochError = new InternalError('Invalid Epoch', 400)
export const InvalidAttesterIdError = new InternalError('Wrong attesterId', 400)
export const InvalidProofError = new InternalError('Invalid proof', 400)
export const InvalidStateTreeError = new InternalError(
    'Invalid State Tree',
    400
)

// vote/post related error
export const InvalidPostIdError = new InternalError('Invalid postId', 400)
export const InvalidVoteActionError = new InternalError(
    'Invalid vote action',
    400
)
export const InvalidEpochKeyError = new InternalError(
    'Invalid Epoch Key: epks is undefined',
    400
)
export const InvalidPageError = new InternalError(
    'Invalid Page: page is undefined',
    400
)
