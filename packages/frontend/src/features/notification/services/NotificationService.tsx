import { useNotificationStore } from '../stores/useNotificationStore'
import { notificationConfig } from '../types/NotificationTypes'

class NotificationService {
    sendNotification(type: string, targetId?: string) {
        const config = notificationConfig[type]

        const actions = config.actions

        const notification = {
            id: Date.now(),
            type,
            message: config.message,
            time: new Date().toLocaleTimeString(),
            isRead: false,
            actions,
            targetId,
        }

        const addNotification = useNotificationStore.getState().addNotification
        addNotification(notification)
    }

    clearNotifications() {
        const resetStore = useNotificationStore.getState().reset
        resetStore()
    }
}

export default new NotificationService()

// Example Usage
// NotificationService.sendNotification('POST_SUCCEEDED', '123')
