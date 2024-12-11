export class InternalError extends Error {
    constructor(
        public message: string,
        public httpStatusCode: number = 500,
        public code: string = 'INTERNAL_ERROR',
    ) {
        super(message)
        this.name = this.constructor.name
    }
}

export const createErrorType = (
    defaultMessage: string,
    httpStatusCode: number = 400,
    code: string,
) => {
    return (customMessage?: string) =>
        new InternalError(customMessage || defaultMessage, httpStatusCode, code)
}

export const Errors = {
    // Transaction related errors
    TRANSACTION_FAILED: createErrorType(
        'Transaction failed',
        400,
        'TRANSACTION_FAILED',
    ),

    // User related errors
    INVALID_HASH_USER_ID: createErrorType(
        'Invalid hashUserId',
        400,
        'INVALID_HASH_USER_ID',
    ),
    USER_ALREADY_SIGNED_UP: createErrorType(
        'The user has already signed up.',
        400,
        'USER_ALREADY_SIGNED_UP',
    ),
    USER_LOGIN_ERROR: createErrorType(
        'Error in login',
        400,
        'USER_LOGIN_ERROR',
    ),

    // General errors
    INVALID_EPOCH: createErrorType('Invalid epoch', 400, 'INVALID_EPOCH'),
    INVALID_EPOCH_KEY: createErrorType(
        'Invalid epoch key',
        400,
        'INVALID_EPOCH_KEY',
    ),
    INVALID_PARAMETERS: createErrorType(
        'Invalid parameters',
        400,
        'INVALID_PARAMETERS',
    ),
    UNSPECIFIED_EPOCH_KEY: createErrorType(
        'Epoch keys must be specified and should be a non-empty string',
        400,
        'UNSPECIFIED_EPOCH_KEY',
    ),
    WRONG_EPOCH_KEY_NUMBER: createErrorType(
        'Wrong number of epoch keys',
        400,
        'WRONG_EPOCH_KEY_NUMBER',
    ),
    INVALID_ATTESTER_ID: createErrorType(
        'Wrong attesterId',
        400,
        'INVALID_ATTESTER_ID',
    ),
    INVALID_PROOF: createErrorType('Invalid proof', 400, 'INVALID_PROOF'),
    INVALID_STATE_TREE: createErrorType(
        'Invalid state tree',
        400,
        'INVALID_STATE_TREE',
    ),
    INVALID_PUBLIC_SIGNAL: createErrorType(
        'Invalid public signal',
        400,
        'INVALID_PUBLIC_SIGNAL',
    ),

    // Sorting related errors
    INVALID_SORT_KEY: createErrorType(
        'sortKey must be "publishedAt" | "voteSum"',
        400,
        'INVALID_SORT_KEY',
    ),
    INVALID_DIRECTION: createErrorType(
        'direction must be "asc" | "desc"',
        400,
        'INVALID_DIRECTION',
    ),

    // General fetching errors
    NO_DATA_FOUND: createErrorType('No data found', 404, 'NO_DATA_FOUND'),

    // Post related errors
    INVALID_POST_ID: createErrorType('Invalid postId', 400, 'INVALID_POST_ID'),
    POST_NOT_EXIST: createErrorType(
        'Post does not exist',
        400,
        'POST_NOT_EXIST',
    ),
    POST_REPORTED: createErrorType(
        'Post has been reported',
        400,
        'POST_REPORTED',
    ),

    // Vote related errors
    INVALID_VOTE_ACTION: createErrorType(
        'Invalid vote action',
        400,
        'INVALID_VOTE_ACTION',
    ),
    INVALID_PAGE: createErrorType(
        'Invalid page: page is undefined',
        400,
        'INVALID_PAGE',
    ),
    EMPTY_POST: createErrorType(
        'Could not have empty content',
        400,
        'EMPTY_POST',
    ),

    // Comment related errors
    INVALID_COMMENT_ID: createErrorType(
        'Invalid commentId',
        400,
        'INVALID_COMMENT_ID',
    ),
    COMMENT_NOT_EXIST: createErrorType(
        'Comment does not exist',
        400,
        'COMMENT_NOT_EXIST',
    ),
    COMMENT_REPORTED: createErrorType(
        'Comment has been reported',
        400,
        'COMMENT_REPORTED',
    ),
    EMPTY_COMMENT: createErrorType(
        'Could not have empty content',
        400,
        'EMPTY_COMMENT',
    ),

    // Transaction related errors
    UNINITIALIZED: createErrorType('Not initialized', 400, 'UNINITIALIZED'),
    NO_DB_CONNECTED: createErrorType('No db connected', 400, 'NO_DB_CONNECTED'),

    // Report related errors
    REPORT_OBJECT_TYPE_NOT_EXISTS: createErrorType(
        'Report object type does not exist',
        400,
        'REPORT_OBJECT_TYPE_NOT_EXISTS',
    ),
    INVALID_REPORT_STATUS: createErrorType(
        'Invalid report status',
        400,
        'INVALID_REPORT_STATUS',
    ),
    INVALID_REPORT_NULLIFIER: createErrorType(
        'Invalid report nullifier',
        400,
        'INVALID_REPORT_NULLIFIER',
    ),
    USER_ALREADY_VOTED: createErrorType(
        'User has already voted',
        400,
        'USER_ALREADY_VOTED',
    ),
    INVALID_ADJUDICATE_VALUE: createErrorType(
        'Invalid adjudicate value',
        400,
        'INVALID_ADJUDICATE_VALUE',
    ),
    INVALID_REPORT_ID: createErrorType(
        'Invalid report id',
        400,
        'INVALID_REPORT_ID',
    ),
    REPORT_NOT_EXIST: createErrorType(
        'Report does not exist',
        400,
        'REPORT_NOT_EXIST',
    ),
    REPORT_VOTING_ENDED: createErrorType(
        'Report voting has ended',
        400,
        'REPORT_VOTING_ENDED',
    ),
    INVALID_EPOCH_RANGE: createErrorType(
        'Invalid epoch range',
        400,
        'INVALID_EPOCH_RANGE',
    ),
    NO_POST_HISTORY_FOUND: createErrorType(
        'No post history found for the given epoch range',
        404,
        'NO_POST_HISTORY_FOUND',
    ),
    NO_COMMENT_HISTORY_FOUND: createErrorType(
        'No comment history found for the given epoch range',
        404,
        'NO_COMMENT_HISTORY_FOUND',
    ),
    NO_VOTE_HISTORY_FOUND: createErrorType(
        'No vote history found for the given epoch range',
        404,
        'NO_VOTE_HISTORY_FOUND',
    ),
    INVALID_REPUTATION_PROOF: createErrorType(
        'Invalid reputation proof',
        400,
        'INVALID_REPUTATION_PROOF',
    ),
    NEGATIVE_REPUTATION_USER: createErrorType(
        'Negative reputation user',
        400,
        'NEGATIVE_REPUTATION_USER',
    ),
    POSITIVE_REPUTATION_USER: createErrorType(
        'Positive reputation user',
        400,
        'POSITIVE_REPUTATION_USER',
    ),
    INVALID_AUTHENTICATION: createErrorType(
        'Invalid authentication',
        400,
        'INVALID_AUTHENTICATION',
    ),
    USER_ALREADY_CLAIMED: createErrorType(
        'User has already claimed',
        400,
        'USER_ALREADY_CLAIMED',
    ),
    INVALID_REP_USER_TYPE: createErrorType(
        'Invalid RepUser Type Error',
        400,
        'INVALID_REP_USER_TYPE',
    ),
}
