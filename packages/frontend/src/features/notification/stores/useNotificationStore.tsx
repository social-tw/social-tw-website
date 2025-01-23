import { NotificationData, NotificationType } from '@/types/Notifications'
import { useCallback } from 'react'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { useNotificationConfig } from '../config/NotificationConfig'

interface NotificationState {
    entities: Record<string, NotificationData>
    list: string[]
    showDot: boolean
    addNotification: (notification: NotificationData) => void
    markAsRead: (id: string) => void
    reset: () => void
    clearNotificationDot: () => void
}

export const initialState: NotificationState = {
    entities: {},
    list: [],
    showDot: false,
    addNotification: (notification: NotificationData) => {},
    markAsRead: (id: string) => {},
    reset: () => {},
    clearNotificationDot: () => {},
}

const getNotificationId = (notification: NotificationData): string => {
    switch (notification.type) {
        case NotificationType.NEW_REPORT_ADJUDICATE:
            return `report_${notification.reportId || notification.id}`
        case NotificationType.LOW_REPUTATION:
            return `${notification.type}_${new Date().toDateString()}`
        default:
            return notification.id
    }
}

// Helper to check if notification already exists
const hasExistingNotification = (
    entities: Record<string, NotificationData>,
    notification: NotificationData,
): boolean => {
    switch (notification.type) {
        case NotificationType.LOW_REPUTATION:
            const today = new Date().toDateString()
            return Object.values(entities).some(
                (n) =>
                    n.type === NotificationType.LOW_REPUTATION &&
                    new Date(n.time).toDateString() === today,
            )
        case NotificationType.NEW_REPORT_ADJUDICATE:
            // use id to check if notification exists
            return Object.values(entities).some(
                (n) =>
                    n.type === NotificationType.NEW_REPORT_ADJUDICATE &&
                    n.id === notification.id,
            )
        default:
            return notification.id in entities
    }
}

export const useNotificationStore = create<NotificationState>()(
    persist(
        (set, get) => ({
            entities: {},
            list: [],
            showDot: false,
            addNotification: (notification: NotificationData) => {
                const state = get()
                const id = getNotificationId(notification)

                if (hasExistingNotification(state.entities, notification)) {
                    return
                }

                const newNotification = {
                    ...notification,
                    id,
                }

                // Only update state if this is a new notification
                if (!state.list.includes(id)) {
                    set({
                        entities: {
                            ...state.entities,
                            [id]: newNotification,
                        },
                        list: [...state.list, id],
                        showDot: true,
                    })
                }
            },
            markAsRead: (id: string) => {
                const state = get()
                if (state.entities[id]) {
                    set({
                        entities: {
                            ...state.entities,
                            [id]: {
                                ...state.entities[id],
                                isRead: true,
                            },
                        },
                    })
                }
            },
            reset: () => {
                set({
                    entities: {},
                    list: [],
                    showDot: false,
                })
            },
            clearNotificationDot: () => {
                set({ showDot: false })
            },
        }),
        {
            name: 'notifications-storage',
            storage: createJSONStorage(() => localStorage),
        },
    ),
)

export const useAllNotifications = () => {
    return useNotificationStore((state) =>
        state.list.map((id) => state.entities[id]),
    )
}

export function useNotifications() {
    return useNotificationStore((state) => state.list)
}

export function useNotificationById(id: string) {
    return useNotificationStore((state) => state.entities[id])
}

export function useSendNotification() {
    const notificationConfig = useNotificationConfig()
    const addNotification = useNotificationStore(
        (state) => state.addNotification,
    )

    const sendNotification = useCallback(
        (type: NotificationType, link?: string, reportId?: string) => {
            const config = notificationConfig[type]
            if (!config) {
                console.warn(
                    `No configuration found for notification type: ${type}`,
                )
                return
            }

            const notification: NotificationData = {
                id:
                    type === NotificationType.NEW_REPORT_ADJUDICATE && reportId
                        ? `report_${reportId}`
                        : Date.now().toString(),
                type,
                message: config.message,
                time: new Date().toLocaleTimeString(),
                isRead: false,
                link,
                reportId:
                    type === NotificationType.NEW_REPORT_ADJUDICATE
                        ? reportId
                        : undefined,
            }
            addNotification(notification)
        },
        [notificationConfig, addNotification],
    )

    return sendNotification
}

export function markAsRead(id: string) {
    useNotificationStore.getState().markAsRead(id)
}

export function clearNotifications() {
    useNotificationStore.getState().clearNotificationDot()
}
