import { TruckGreen } from 'iconoir-react'
import { notificationConfig } from '../types/NotificationTypes'

interface Notification {
    id: number
    type: string
    message: string
    time: string
    isRead: boolean
    actions?: NotificationAction[] // Array of actions
}

interface NotificationAction {
    label: string
    execute: () => void
}

class NotificationService {
    async fetchNotifications(): Promise<Notification[]> {
        // Sample notification data; in a real app, this might come from an API
        const notifications = [
            { id: 1, type: 'SIGN_UP_SUCCESS', time: '5 minutes ago', isRead: false },
            { id: 2, type: 'POST_SUCCEEDED', time: '1 hour ago', isRead: false },
            { id: 3, type: 'POST_FAILED', time: '2 hours ago', isRead: false },
            { id: 4, type: 'COMMENT_SUCCEEDED', time: '3 hours ago', isRead: false },
            { id: 5, type: 'COMMENT_FAILED', time: '4 hours ago', isRead: false },
            { id: 6, type: 'UPVOTE_SUCCEEDED', time: '5 hours ago', isRead: false },
            { id: 7, type: 'UPVOTE_FAILED', time: '6 hours ago', isRead: false },
            { id: 8, type: 'DOWNVOTE_SUCCEEDED', time: '7 hours ago', isRead: false },
            { id: 9, type: 'DOWNVOTE_FAILED', time: '8 hours ago', isRead: false },
            { id: 10, type: 'REPORT_SUCCEEDED', time: '9 hours ago', isRead: false },
            { id: 11, type: 'REPORT_FAILED', time: '10 hours ago', isRead: false },
            { id: 12, type: 'REPORT_PASSED', time: '11 hours ago', isRead: false },
            { id: 13, type: 'REPORT_REJECTED', time: '12 hours ago', isRead: false },
            { id: 14, type: 'BE_REPORTED', time: '13 hours ago', isRead: false },
            { id: 15, type: 'ADJUDICATE_SUCCEEDED', time: '14 hours ago', isRead: false },
            { id: 16, type: 'ADJUDICATE_FAILED', time: '15 hours ago', isRead: false },
            { id: 17, type: 'ADJUDICATE_RESULT_PASSED', time: '16 hours ago', isRead: false },
            { id: 18, type: 'ADJUDICATE_RESULT_REJECTED', time: '17 hours ago', isRead: false },
            { id: 19, type: 'NEW_REPORT_ADJUDICATE', time: '18 hours ago', isRead: false },
            { id: 20, type: 'LOW_REPUTATION', time: '19 hours ago', isRead: false },
        ]
        
        // Map each notification type to its configuration in `notificationTypes`
        return notifications.map((notification) => {
            const config = notificationConfig[notification.type]
            return {
                id: notification.id,
                type: config.type,
                message: config.message,
                time: notification.time,
                isRead: notification.isRead,
                actions: config.actions,
            }
        })
    }
}

export default new NotificationService()
