import React from 'react'
import { useNotificationConfig } from '../../config/NotificationConfig'
import {
    markAsRead,
    useNotificationById,
} from '../../stores/useNotificationStore'

interface NotificationItemProps {
    id: string
}

const NotificationItem: React.FC<NotificationItemProps> = ({ id }) => {
    const data = useNotificationById(id)
    const isRead = data.isRead
    const time = data.time
    const notificationConfig = useNotificationConfig()
    const config = notificationConfig[data.type]
    const IconComponent = config.icon
    const message = config.message
    const actions = config.actions

    return (
        <div className="relative flex items-center p-3 mb-4 bg-gray-100 shadow-md rounded-2xl">
            {isRead && (
                <div className="absolute inset-0 z-10 bg-black pointer-events-none bg-opacity-40 rounded-2xl"></div>
            )}

            <div className="flex items-center w-full">
                <div className="flex items-center justify-center flex-shrink-0 h-full mr-4">
                    {IconComponent ? (
                        <IconComponent className="w-8 h-8" />
                    ) : null}
                </div>

                <div className="flex-grow">
                    <p className="mb-1 text-xs text-gray-500">{time}</p>
                    <p
                        className={`text-sm ${
                            isRead ? 'text-gray-500' : 'text-black'
                        }`}
                    >
                        {message}
                    </p>

                    <div className="flex justify-end mt-2 space-x-4">
                        {actions?.map((action, index) => (
                            <button
                                key={index}
                                onClick={() => {
                                    action.execute(data)
                                    markAsRead(id)
                                }}
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
