import { NotificationData, NotificationType } from '@/types/Notifications'
import { useNotificationStore } from './useNotificationStore'

// Mock localStorage
const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    clear: jest.fn(),
    removeItem: jest.fn(),
    length: 0,
    key: jest.fn(),
}

Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true,
})

// Mock storage for persist middleware
jest.mock('zustand/middleware', () => ({
    ...jest.requireActual('zustand/middleware'),
    persist: (config: any) => (set: any, get: any, store: any) => {
        const state = config(
            (...args: any) => {
                set(...args)
            },
            get,
            store,
        )
        return {
            ...state,
            persist: () => {},
        }
    },
}))

describe('useNotificationStore', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        useNotificationStore.getState().reset()
    })

    describe('addNotification', () => {
        it('should add normal notification with unique id', () => {
            const notification: NotificationData = {
                id: '123',
                type: NotificationType.POST_SUCCEEDED,
                message: 'Test message',
                time: new Date().toLocaleTimeString(),
                isRead: false,
            }

            useNotificationStore.getState().addNotification(notification)
            const state = useNotificationStore.getState()

            expect(state.entities['123']).toEqual({
                ...notification,
                id: '123',
            })
            expect(state.list).toContain('123')
        })

        it('should prevent duplicate check-in notifications on the same day', () => {
            const notification: NotificationData = {
                id: 'check-in-1',
                type: NotificationType.LOW_REPUTATION,
                message: 'Low reputation',
                time: new Date().toLocaleTimeString(),
                isRead: false,
            }

            // Add first notification
            useNotificationStore.getState().addNotification(notification)

            // Try to add second notification
            const secondNotification = {
                ...notification,
                id: 'check-in-1',
            }
            useNotificationStore.getState().addNotification(secondNotification)

            const state = useNotificationStore.getState()
            expect(Object.keys(state.entities).length).toBe(1)
            expect(state.list.length).toBe(1)
        })

        it('should prevent duplicate adjudication notifications with same report id', () => {
            const reportId = 'report-123'
            const notification: NotificationData = {
                id: `report_${reportId}`,
                type: NotificationType.NEW_REPORT_ADJUDICATE,
                message: 'New report',
                time: new Date().toLocaleTimeString(),
                isRead: false,
                reportId,
            }

            // Add first notification
            useNotificationStore.getState().addNotification(notification)

            // Try to add second notification with same report id
            const secondNotification = {
                ...notification,
                message: 'Same report, different message',
                time: new Date().toLocaleTimeString(),
            }
            useNotificationStore.getState().addNotification(secondNotification)

            const state = useNotificationStore.getState()
            expect(Object.keys(state.entities).length).toBe(1)
            expect(state.list.length).toBe(1)
            // Check that the notification exists with the correct ID format
            expect(state.entities[`report_${reportId}`]).toBeTruthy()
        })
    })
})
