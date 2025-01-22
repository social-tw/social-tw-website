import { NotificationData, NotificationType } from '@/types/Notifications'
import { useCallback } from 'react'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
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

const initialState: NotificationState = {
    entities: {},
    list: [],
    showDot: false,
    addNotification: (notification: NotificationData) => {},
    markAsRead: (id: string) => {},
    reset: () => {},
    clearNotificationDot: () => {},
}

// Helper to check if notification already exists
const hasExistingNotification = (
    entities: Record<string, NotificationData>,
    notification: NotificationData,
): boolean => {
    // For check-in notifications, check if there's one today
    if (notification.type === NotificationType.LOW_REPUTATION) {
        const today = new Date().toDateString()
        return Object.values(entities).some(
            (n) =>
                n.type === NotificationType.LOW_REPUTATION &&
                new Date(n.time).toDateString() === today,
        )
    }

    // For adjudication notifications, check if same report exists
    if (
        notification.type === NotificationType.NEW_REPORT_ADJUDICATE &&
        notification.link
    ) {
        return Object.values(entities).some(
            (n) =>
                n.type === NotificationType.NEW_REPORT_ADJUDICATE &&
                n.link === notification.link,
        )
    }

    return false
}

export const useNotificationStore = create<NotificationState>()(
    persist(
        immer((set) => ({
            ...initialState,
            addNotification: (notification: NotificationData) => {
                set((state) => {
                    // Generate appropriate ID
                    const id =
                        notification.type ===
                        NotificationType.NEW_REPORT_ADJUDICATE
                            ? notification.link || Date.now().toString()
                            : notification.id.toString()

                    // Only add if no duplicate exists
                    if (
                        !hasExistingNotification(state.entities, notification)
                    ) {
                        state.entities[id] = notification
                        state.list.push(id)
                        state.showDot = true
                    }
                })
            },
            markAsRead: (id: string) => {
                set((state) => {
                    if (state.entities[id]) {
                        state.entities[id].isRead = true
                    }
                })
            },
            reset: () => {
                set({ ...initialState })
            },
            clearNotificationDot: () => {
                set({ showDot: false })
            },
        })),
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
        (type: NotificationType, link?: string) => {
            const config = notificationConfig[type]
            if (!config) {
                console.warn(
                    `No configuration found for notification type: ${type}`,
                )
                return
            }

            const notification: NotificationData = {
                id: Date.now().toString(),
                type,
                message: config.message,
                time: new Date().toLocaleTimeString(),
                isRead: false,
                link,
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
