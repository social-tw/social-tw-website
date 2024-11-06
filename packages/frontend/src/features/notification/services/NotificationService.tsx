import { useNotificationStore } from '../stores/useNotificationStore'
import { notificationConfig } from '../types/NotificationTypes'
import { NotificationAction } from '../types/NotificationTypes'


class NotificationService {
    sendNotification(type: string, targetId?: string) {
        const config = notificationConfig[type]
        
        // Evaluate actions to ensure it's always an array or undefined
        const actions = typeof config.actions === 'function' && targetId
            ? config.actions(targetId) // Call the function with targetId
            : config.actions as NotificationAction[] | undefined // Otherwise, use it as an array or undefined

        const notification = {
            id: Date.now(),
            type,
            message: config.message,
            time: new Date().toLocaleTimeString(),
            isRead: false,
            actions, // Ensure actions is always an array or undefined
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

// NotificationService.sendNotification('SIGN_UP_SUCCESS')