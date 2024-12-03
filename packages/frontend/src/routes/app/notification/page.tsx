import React, { useEffect } from 'react'
import NotificationItem from '@/features/notification/components/NotificationItem/NotificationItem'
import { useNotificationStore } from '@/features/notification/stores/useNotificationStore'

const NotificationPage: React.FC = () => {
    const notifications = useNotificationStore((state) => state.notifications)
    const loadReadStatuses = useNotificationStore(
        (state) => state.loadNotifications,
    )

    useEffect(() => {
        // Load read statuses from local storage
        loadReadStatuses()
    }, [loadReadStatuses])

    if (!notifications || notifications.length === 0) {
        return <p></p>
    }

    return (
        <div className="relative px-4 py-8 md:pt-24 text-white min-h-screen">
            <div className="absolute top-0 left-0 right-0 px-4 py-4 rounded-lg">
                <p className="text-sm">
                    歡迎來到通知中心，這些通知訊息僅會在你本次的登入期間中保留著。當你登出後這些訊息將清空。
                    若需要查看過去的一些上鏈交易的歷史紀錄，可以到「我的帳號」
                    {'>'}「歷史紀錄」跟「聲譽分數」的頁面中做查詢。
                </p>
            </div>
            <div className="pt-24 space-y-4">
                {[...notifications].reverse().map((notification) => (
                    <NotificationItem
                        key={notification.id}
                        notificationId={notification.id}
                    />
                ))}
            </div>
        </div>
    )
}

export default NotificationPage
