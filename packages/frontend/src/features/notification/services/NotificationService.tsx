import { useNotificationStore } from '../stores/useNotificationStore'
import { notificationConfig } from '../types/NotificationTypes'
import { NotificationAction } from '../types/NotificationTypes'


class NotificationService {
    sendNotification(type: string, targetId?: string) {
        const config = notificationConfig[type]

        // Check if actions is a function, and if so, call it with targetId
        const actions: NotificationAction[] | undefined = 
            typeof config.actions === 'function' && targetId 
                ? config.actions(targetId) 
                : config.actions as NotificationAction[] | undefined

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
