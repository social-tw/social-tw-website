import React, { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { QueryKeys } from '@/constants/queryKeys'
import NotificationService from '@/features/notification/services/NotificationService'
import NotificationItem from '@/features/notification/components/NotificationItem'
import { useNotificationStore } from '@/features/notification/stores/NotificationStores'

const NotificationPage: React.FC = () => {
    const { data: notifications, isLoading, error } = useQuery({
        queryKey: [QueryKeys.Notifications],
        queryFn: async () => NotificationService.fetchNotifications(),
    })

    const addNotification = useNotificationStore((state) => state.addNotification)
    const loadReadStatuses = useNotificationStore((state) => state.loadReadStatuses)

    useEffect(() => {
        // Load read statuses from local storage
        loadReadStatuses()
    }, [loadReadStatuses])

    useEffect(() => {
        if (notifications) {
            notifications.forEach((notification) => addNotification(notification))
        }
    }, [notifications, addNotification])

    if (isLoading) return <p>Loading notifications...</p>
    if (error) return <p>Failed to load notifications.</p>
    if (!notifications || notifications.length === 0) return <p>No notifications available.</p>

    return (
        <div className="relative px-4 py-8 md:pt-24 text-white min-h-screen">
            <div className="absolute top-0 left-0 right-0 px-4 py-4 rounded-lg">
                <p className="text-sm">
                    歡迎來到通知中心，這些通知訊息僅會在你本次的登入期間中保留著。當你登出後這些訊息將清空。
                    若需要查看過去的一些上鏈交易的歷史紀錄，可以到「我的帳號」{">"}「歷史紀錄」跟「聲譽分數」的頁面中做查詢。
                </p>
            </div>
            <div className="pt-24 space-y-4">
                {notifications.map((notification) => (
                    <NotificationItem key={notification.id} notificationId={notification.id} />
                ))}
            </div>
        </div>
    )
}

export default NotificationPage
