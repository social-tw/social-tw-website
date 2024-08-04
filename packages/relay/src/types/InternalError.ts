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
    'Invalid state tree',
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

// general fetching error
export const NoDataFoundError = new InternalError('No data found', 404)

// post related error
export const InvalidPostIdError = new InternalError('Invalid postId', 400)
export const PostNotExistError = new InternalError('Post does not exist', 400)
export const PostReportedError = new InternalError(
    'Post has been reported',
    400
)

// vote related error
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
export const InvalidCommentIdError = new InternalError('Invalid commentId', 400)
export const CommentNotExistError = new InternalError(
    'Comment does not exist',
    400
)
export const CommentReportedError = new InternalError(
    'Comment has been reported',
    400
)
export const EmptyCommentError = new InternalError(
    'Could not have empty content',
    400
)

// transaction related error
export const UninitializedError = new InternalError('Not initialized', 400)
export const NoDBConnectedError = new InternalError('No db connected', 400)

// report related error
export const ReportObjectTypeNotExistsError = new InternalError(
    'Report object type does not exist',
    400
)
export const InvalidReportStatusError = new InternalError(
    'Invalid report status',
    400
)

export const InvalidReportNullifierError = new InternalError(
    'Invalid report nullifier',
    400
)

export const UserAlreadyVotedError = new InternalError(
    'User has already voted',
    400
)

export const InvalidAdjudicateValueError = new InternalError(
    'Invalid adjudicate value',
    400
)

export const InvalidReportIdError = new InternalError('Invalid report id', 400)

export const ReportNotExistError = new InternalError(
    'Report does not exist',
    400
)

export const ReportVotingEndedError = new InternalError(
    'Report voting has ended',
    400
)

export const InvalidEpochRangeError = new InternalError(
    'Invalid epoch range',
    400
)

export const NoPostHistoryFoundError = new InternalError(
    'No post history found for the given epoch range',
    404
)

export const NoCommentHistoryFoundError = new InternalError(
    'No comment history found for the given epoch range',
    404
)

export const NoVoteHistoryFoundError = new InternalError(
    'No vote history found for the given epoch range',
    404
)

export const InvalidReputationProofError = new InternalError(
    'Invalid reputation proof',
    400
)

export const NegativeReputationUserError = new InternalError(
    'Negative reputation user',
    400
)

export const InvalidAuthenticationError = new InternalError(
    'Invalid authentication',
    400
)
