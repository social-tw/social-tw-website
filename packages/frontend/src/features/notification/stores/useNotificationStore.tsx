import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { NotificationData } from '@/types/Notifications'
import { NotificationType } from '@/types/Notifications'
import { useNotificationConfig } from '../config/NotificationConfig'
import { useCallback } from 'react'

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

export const useNotificationStore = create<NotificationState>()(
    persist(
        immer((set) => ({
            ...initialState,
            addNotification: (notification: NotificationData) => {
                set((state) => {
                    const id = notification.id.toString()
                    if (!state.entities[id]) {
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
