import React from 'react'
import { useNotificationStore } from '../stores/useNotificationStore'
import { notificationConfig } from '../types/NotificationTypes'

interface NotificationItemProps {
    notificationId: number
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notificationId }) => {
    const notification = useNotificationStore((state) =>
        state.notifications.find((n) => n.id === notificationId)
    )
    const markAsRead = useNotificationStore((state) => state.markAsRead)

    if (!notification) return null // Render nothing if notification is not found

    const handleAction = (execute: () => void) => {
        execute()
        markAsRead(notification.id)
    }

    const config = notificationConfig[notification.type]
    const IconComponent = config?.icon

    // Ensure `actions` is an array by checking if it's a function and calling it if necessary
    const actions = Array.isArray(config.actions)
        ? config.actions
        : typeof config.actions === 'function' && notification.targetId
            ? config.actions(notification.targetId)
            : []

    return (
        <div className="relative flex items-center p-3 rounded-2xl shadow-md mb-4 bg-gray-100">
            {/* Overlay for read notifications, with pointer-events-none to allow click-through */}
            {notification.isRead && (
                <div className="absolute inset-0 bg-black bg-opacity-40 rounded-2xl z-20 pointer-events-none"></div>
            )}

            <div className="flex items-center w-full z-10">
                <div className="mr-4 flex-shrink-0 flex items-center justify-center h-full">
                    {IconComponent ? <IconComponent className="w-8 h-8" /> : null}
                </div>

                <div className="flex-grow">
                    <p className={`text-xs mb-1 text-gray-500`}>{notification.time}</p>
                    <p className={`text-sm ${notification.isRead ? 'text-gray-500' : 'text-black'}`}>
                        {notification.message}
                    </p>

                    {/* Render multiple actions aligned to the right */}
                    <div className="flex justify-end space-x-4 mt-2">
                        {actions.map((action, index) => (
                            <button
                                key={index}
                                onClick={() => handleAction(action.execute)}
                                className={`text-xs underline ${notification.isRead ? 'text-gray-400' : ''}`} 
                                style={{ color: notification.isRead ? undefined : '#4A9BAA' }}
                            >
                                {action.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default NotificationItem
