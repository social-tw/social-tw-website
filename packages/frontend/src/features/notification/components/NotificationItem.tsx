// NotificationItem.tsx
import React from 'react'
import { useNotificationStore } from '../stores/useNotificationStore'
import { notificationConfig } from '../types/NotificationTypes'
import { useNavigate } from 'react-router-dom'
import { PATHS } from '@/constants/paths'

interface NotificationItemProps {
    notificationId: number
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notificationId }) => {
    const notification = useNotificationStore((state) =>
        state.notifications.find((n) => n.id === notificationId)
    )
    const markAsRead = useNotificationStore((state) => state.markAsRead)
    const navigate = useNavigate()

    if (!notification) return null // Render nothing if notification is not found

    const handleAction = (actionType: string, targetId?: string) => {
        console.log(actionType, targetId)
        switch (actionType) {
            case "viewPost":
                if (targetId) navigate(`/posts/${targetId}`)
                break
            case "rewritePost":
                navigate(`/?failedPostId=${targetId}`)
                break
            case "viewComment":
                if (targetId) navigate(`/posts/${targetId}`)
                break
            case "rewriteComment":
                if (targetId) navigate(`/posts/${targetId}`)
                break
            case "reportDialog":
                if (targetId) navigate(`/reports/${targetId}`)
                break
            case "reportResult":
                if (targetId) navigate(`/reports/${targetId}`)
                break
            case "adjudicationDialog":
                if (targetId) navigate(`/reports/${targetId}`)
                break
            case "checkIn":
                if (targetId) navigate(`/report/${targetId}`)
                break
            default:
                console.warn("Unknown action type:", actionType)
        }
        markAsRead(notification.id)
    }

    const config = notificationConfig[notification.type]
    const IconComponent = config?.icon
    const actions = config.actions || []

    return (
        <div className="relative flex items-center p-3 rounded-2xl shadow-md mb-4 bg-gray-100">
            {notification.isRead && (
                <div className="absolute inset-0 bg-black bg-opacity-40 rounded-2xl z-20 pointer-events-none"></div>
            )}

            <div className="flex items-center w-full z-10">
                <div className="mr-4 flex-shrink-0 flex items-center justify-center h-full">
                    {IconComponent ? <IconComponent className="w-8 h-8" /> : null}
                </div>

                <div className="flex-grow">
                    <p className="text-xs mb-1 text-gray-500">{notification.time}</p>
                    <p className={`text-sm ${notification.isRead ? 'text-gray-500' : 'text-black'}`}>
                        {notification.message}
                    </p>

                    <div className="flex justify-end space-x-4 mt-2">
                        {actions.map((action, index) => (
                            <button
                                key={index}
                                onClick={() => handleAction(action.type, notification.targetId)}
                                className="text-xs underline text-[#4A9BAA]"
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
