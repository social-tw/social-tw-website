import { ReactComponent as AdjudicateFailedIcon } from '@/assets/svg/notification/adjuducate-failed.svg'
import { ReactComponent as AdjudicateResultNotPassIcon } from '@/assets/svg/notification/adjuducate-result-not-pass.svg'
import { ReactComponent as AdjudicateResultPassIcon } from '@/assets/svg/notification/adjuducate-result-pass.svg'
import { ReactComponent as AdjudicateSuccessIcon } from '@/assets/svg/notification/adjuducate-success.svg'
import { ReactComponent as CommentFailedIcon } from '@/assets/svg/notification/comment-failed.svg'
import { ReactComponent as CommentSuccessIcon } from '@/assets/svg/notification/comment-success.svg'
import { ReactComponent as DownvoteFailedIcon } from '@/assets/svg/notification/downvote-failed.svg'
import { ReactComponent as DownvoteSuccessIcon } from '@/assets/svg/notification/downvote-success.svg'
import { ReactComponent as NewAdjudicationIcon } from '@/assets/svg/notification/new-adjuducation.svg'
import { ReactComponent as PostFailedIcon } from '@/assets/svg/notification/post-failed.svg'
import { ReactComponent as PostSuccessIcon } from '@/assets/svg/notification/post-success.svg'
import { ReactComponent as ReportRejected } from '@/assets/svg/notification/report-rejected.svg'
import { ReactComponent as ReportPassed } from '@/assets/svg/notification/report-pass.svg'
import { ReactComponent as ReportFailedIcon } from '@/assets/svg/notification/report-failed.svg'
import { ReactComponent as ReportSuccessIcon } from '@/assets/svg/notification/report-success.svg'
import { ReactComponent as ReportedIcon } from '@/assets/svg/notification/reported.svg'
import { ReactComponent as ReputationTooLowIcon } from '@/assets/svg/notification/reputation-too-low.svg'
import { ReactComponent as SignupSuccessIcon } from '@/assets/svg/notification/signup-success.svg'
import { ReactComponent as UpvoteFailedIcon } from '@/assets/svg/notification/upvote-failed.svg'
import { ReactComponent as UpvoteSuccessIcon } from '@/assets/svg/notification/upvote-success.svg'

export type NotificationAction = {
    label: string
    type: string 
}

export interface NotificationConfig {
    type: string
    message: string
    actions?: NotificationAction[]
    icon?: React.FunctionComponent<React.SVGProps<SVGSVGElement>>
}

export const notificationConfig: Record<string, NotificationConfig> = {
    SIGN_UP_SUCCESS: {
        type: 'SIGN_UP_SUCCESS',
        message:
            '恭喜註冊成功，歡迎加入Unirep Social TW。有任何疑問可以參閱「平台說明」頁面',
        icon: SignupSuccessIcon,
    },
    POST_SUCCEEDED: {
        type: 'POST_SUCCEEDED',
        message: '你的貼文發佈成功！',
        actions: [{ label: '前往查看', type: 'viewPost' }],
        icon: PostSuccessIcon,
    },
    POST_FAILED: {
        type: 'POST_FAILED',
        message: '你的貼文發佈未成功，可透過連結前往查看，並再嘗試發佈一次',
        actions: [{ label: '前往查看', type: 'rewritePost' }],
        icon: PostFailedIcon,
    },
    COMMENT_SUCCEEDED: {
        type: 'COMMENT_SUCCEEDED',
        message: '你的留言發佈成功！',
        actions: [
            // { label: "查看區塊鏈瀏覽器", execute: () => console.log("Navigating to blockchain explorer") },
            { label: '前往查看', type: 'viewComment' },
        ],
        icon: CommentSuccessIcon,
    },
    COMMENT_FAILED: {
        type: 'COMMENT_FAILED',
        message: '你的留言發佈未成功，可透過連結前往查看，並再嘗試發佈一次',
        actions: [{ label: '前往查看', type: 'rewriteComment' }],
        icon: CommentFailedIcon,
    },
    UPVOTE_SUCCEEDED: {
        type: 'UPVOTE_SUCCEEDED',
        message: '你的貼文按讚成功！',
        actions: [{ label: '前往查看', type: 'viewPost' }],
        icon: UpvoteSuccessIcon,
    },
    UPVOTE_FAILED: {
        type: 'UPVOTE_FAILED',
        message: '你的貼文按讚未成功，可透過連結前往查看，並再嘗試按讚一次',
        actions: [{ label: '前往查看', type: 'viewPost' }],
        icon: UpvoteFailedIcon,
    },
    DOWNVOTE_SUCCEEDED: {
        type: 'DOWNVOTE_SUCCEEDED',
        message: '你的貼文倒讚成功！',
        actions: [{ label: '前往查看', type: 'viewPost' }],
        icon: DownvoteSuccessIcon,
    },
    DOWNVOTE_FAILED: {
        type: 'DOWNVOTE_FAILED',
        message: '你的貼文倒讚未成功，可透過連結前往查看，並再嘗試倒讚一次',
        actions: [{ label: '前往查看', type: 'viewPost' }],
        icon: DownvoteFailedIcon,
    },
    REPORT_SUCCEEDED: {
        type: 'REPORT_SUCCEEDED',
        message: '你的不當內容檢舉申請送出成功！待 5 位平台用戶進行評判',
        icon: ReportSuccessIcon,
    },
    REPORT_FAILED: {
        type: 'REPORT_FAILED',
        message:
            '你的不當內容檢舉申請送出未成功，可透過連結前往查看，並再嘗試送出申請一次',
        actions: [{ label: '前往查看', type: 'reportDialog' }],
        icon: ReportFailedIcon,
    },
    REPORT_PASSED: {
        type: 'REPORT_PASSED',
        message: '你的貼文檢舉案件被評判通過，你的聲譽分數提高 3 分',
        actions: [
            // { label: "查看區塊鏈瀏覽器", execute: () => console.log("Navigating to blockchain explorer") },
            { label: '前往查看', type: 'reportResult' },
        ],
        icon: ReportPassed,
    },
    REPORT_REJECTED: {
        type: 'REPORT_REJECTED',
        message:
            '很遺憾通知你，你的貼文檢舉案件被評判否決，你的聲譽分數降低 1 分',
        actions: [
            // { label: "查看區塊鏈瀏覽器", execute: () => console.log("Navigating to blockchain explorer") },
            { label: '前往查看', type: 'reportResult' },
        ],
        icon: ReportRejected,
    },
    BE_REPORTED: {
        type: 'BE_REPORTED',
        message:
            '很遺憾通知你，你的內容（貼文/留言）被檢舉，並且評判通過，你的聲譽分數降低 5 分',
        actions: [{ label: '前往查看', type: 'reportResult' }],
        icon: ReportedIcon,
    },
    ADJUDICATE_SUCCEEDED: {
        type: 'ADJUDICATE_SUCCEEDED',
        message:
            '你的檢舉案件評判協助完成，你的聲譽分數提高 1 分，評判最終結果出爐會再另行通知',
        icon: AdjudicateSuccessIcon,
    },
    ADJUDICATE_FAILED: {
        type: 'ADJUDICATE_FAILED',
        message:
            '你的檢舉案件評判協助未成功，可透過連結前往查看，並再嘗試評判一次',
        actions: [{ label: '前往查看', type: 'adjudicationDialog' }],
        icon: AdjudicateFailedIcon,
    },
    ADJUDICATE_RESULT_PASSED: {
        type: 'ADJUDICATE_RESULT_PASSED',
        message: '你協助的檢舉案件評判結果出爐！結果為「檢舉通過」',
        actions: [{ label: '前往查看', type: 'reportResult' }],
        icon: AdjudicateResultPassIcon,
    },
    ADJUDICATE_RESULT_REJECTED: {
        type: 'ADJUDICATE_RESULT_REJECTED',
        message: '你協助的檢舉案件評判結果出爐！結果為「檢舉不通過」',
        actions: [{ label: '前往查看', type: 'reportResult' }],
        icon: AdjudicateResultNotPassIcon,
    },
    NEW_REPORT_ADJUDICATE: {
        type: 'NEW_REPORT_ADJUDICATE',
        message:
            '有新的檢舉案被提交，需要 5 位用戶參與檢舉案評判，參與評判者可提高聲譽分數 1 分',
        actions: [{ label: '前往查看', type: 'adjudicationDialog' }],
        icon: NewAdjudicationIcon,
    },
    LOW_REPUTATION: {
        type: 'LOW_REPUTATION',
        message:
            '你的聲譽分數目前低於 0 分，可以透過進行「每日簽到」來提高聲譽分數，進而恢復你的平台操作權利。點擊連結前往每日簽到',
        actions: [{ label: '前往查看', type: 'checkIn' }],
        icon: ReputationTooLowIcon,
    },
}
