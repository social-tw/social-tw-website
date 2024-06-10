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
export const InvalidEpochError = new InternalError('Invalid epoch', 400)
export const InvalidEpochKeyError = new InternalError('Invalid epoch key', 400)
export const InvalidParametersError = new InternalError(
    'Invalid parameters',
    400
)
export const UnspecifiedEpochKeyError = new InternalError(
    'Epoch keys must be specified and should be a non-empty string',
    400
)
export const WrongEpochKeyNumberError = new InternalError(
    'Wrong number of epoch keys',
    400
)
export const InvalidAttesterIdError = new InternalError('Wrong attesterId', 400)
export const InvalidProofError = new InternalError('Invalid proof', 400)
export const InvalidStateTreeError = new InternalError(
    'Invalid State Tree',
    400
)
export const InvalidPublicSignalError = new InternalError(
    'Invalid public signal',
    400
)

// sorting related error
export const InvalidSortKeyError = new InternalError(
    'sortKey must be "publishedAt" | "voteSum"',
    400
)
export const InvalidDirectionError = new InternalError(
    'direction must be "asc" | "desc"',
    400
)

// vote/post related error
export const InvalidPostIdError = new InternalError('Invalid postId', 400)
export const InvalidVoteActionError = new InternalError(
    'Invalid vote action',
    400
)
export const InvalidPageError = new InternalError(
    'Invalid page: page is undefined',
    400
)
export const EmptyPostError = new InternalError(
    'Could not have empty content',
    400
)

// comment related error
export const CommentNotExistError = new InternalError(
    'Comment does not exist',
    400
)
export const EmptyCommentError = new InternalError(
    'Could not have empty content',
    400
)

// transaction related error
export const UninitializedError = new InternalError('Not initialized', 400)
export const NoDBConnectedError = new InternalError('No db connected', 400)
