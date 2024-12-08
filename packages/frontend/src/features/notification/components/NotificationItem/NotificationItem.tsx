import React from 'react'
import { useNotificationConfig } from '../../config/NotificationConfig'
import {
    useNotificationById,
    markAsRead,
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
        <div className="relative flex items-center p-3 rounded-2xl shadow-md mb-4 bg-gray-100">
            {isRead && (
                <div className="absolute inset-0 bg-black bg-opacity-40 rounded-2xl z-20 pointer-events-none"></div>
            )}

            <div className="flex items-center w-full z-10">
                <div className="mr-4 flex-shrink-0 flex items-center justify-center h-full">
                    {IconComponent ? (
                        <IconComponent className="w-8 h-8" />
                    ) : null}
                </div>

                <div className="flex-grow">
                    <p className="text-xs mb-1 text-gray-500">{time}</p>
                    <p
                        className={`text-sm ${
                            isRead ? 'text-gray-500' : 'text-black'
                        }`}
                    >
                        {message}
                    </p>

                    <div className="flex justify-end space-x-4 mt-2">
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
