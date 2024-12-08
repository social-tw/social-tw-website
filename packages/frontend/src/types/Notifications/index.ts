export enum NotificationType {
    SIGN_UP_SUCCESS,
    POST_SUCCEEDED,
    POST_FAILED,
    COMMENT_SUCCEEDED,
    COMMENT_FAILED,
    UPVOTE_SUCCEEDED,
    UPVOTE_FAILED,
    DOWNVOTE_SUCCEEDED,
    DOWNVOTE_FAILED,
    REPORT_SUCCEEDED,
    REPORT_FAILED,
    REPORT_PASSED,
    REPORT_REJECTED,
    BE_REPORTED,
    ADJUDICATE_SUCCEEDED,
    ADJUDICATE_FAILED,
    ADJUDICATE_RESULT_PASSED,
    ADJUDICATE_RESULT_REJECTED,
    NEW_REPORT_ADJUDICATE,
    LOW_REPUTATION,
}

export interface NotificationData {
    id: string
    type: NotificationType
    message: string
    time: string
    isRead: boolean
    link?: string
    txHash?: string
}

interface NotificationAction {
    label: string
    execute: (data: NotificationData) => void
}

export interface NotificationMeta {
    type: NotificationType
    message: string
    actions?: NotificationAction[]
    icon?: React.FunctionComponent<React.SVGProps<SVGSVGElement>>
}
