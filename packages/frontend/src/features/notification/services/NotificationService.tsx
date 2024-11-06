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
        console.log(notification)

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
