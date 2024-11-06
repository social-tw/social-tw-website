import { useNotificationStore } from '../stores/useNotificationStore'
import { notificationConfig } from '../types/NotificationTypes'



class NotificationService {
    sendNotification(type: string) {
        const config = notificationConfig[type]
        const notification = {
            id: Date.now(), // Use timestamp as unique ID
            type,
            message: config.message,
            time: new Date().toLocaleTimeString(),
            isRead: false,
            actions: config.actions,
        }

        const addNotification = useNotificationStore.getState().addNotification
        addNotification(notification)
    }
}

export default new NotificationService()
