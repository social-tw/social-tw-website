import React from 'react'
import { useNotificationStore } from '../stores/NotificationStores'
import { notificationConfig } from '../types/NotificationTypes'

interface Notification {
    id: number
    type: string
    message: string
    time: string
    isRead: boolean
    actionLabel?: string
    action?: () => void
}

interface NotificationItemProps {
    notification: Notification
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification }) => {
    const markAsRead = useNotificationStore((state) => state.markAsRead)

    const handleAction = (execute: () => void) => {
        execute()
        markAsRead(notification.id)
    }

    // Get the icon component based on notification type
    const config = notificationConfig[notification.type]
    const IconComponent = notificationConfig[notification.type]?.icon

    return (
        <div className="flex items-center p-3 rounded-lg shadow-md mb-4 bg-gray-100">
            <div className="mr-4 flex-shrink-0 flex items-center justify-center h-full">
                {IconComponent ? <IconComponent className="w-8 h-8" /> : null}
            </div>

            <div className="flex-grow">
                <p className="text-xs text-gray-500 mb-1">{notification.time}</p>
                <p className="text-sm text-black">{notification.message}</p>

                {/* Render multiple actions aligned to the right */}
                <div className="flex justify-end space-x-4 mt-2">
                    {config?.actions?.map((action, index) => (
                        <button
                            key={index}
                            onClick={() => handleAction(action.execute)}
                            className="text-blue-600 text-xs underline"
                        >
                            {action.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default NotificationItem
