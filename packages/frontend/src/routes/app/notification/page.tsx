import NotificationItem from '@/features/notification/components/NotificationItem/NotificationItem'
import { useAllNotifications } from '@/features/notification/stores/useNotificationStore'
import React from 'react'

const NotificationPage: React.FC = () => {
    const notifications = useAllNotifications()

    if (!notifications || notifications.length === 0) {
        return <p></p>
    }

    return (
        <div className="px-4 pt-5 pb-10 space-y-5 lg:px-0">
            <section className="px-4">
                <p className="text-xs leading-7 text-white md:text-sm md:leading-7">
                    歡迎來到通知中心，這些通知訊息僅會在你本次的登入期間中保留著。當你登出後這些訊息將清空。
                    若需要查看過去的一些上鏈交易的歷史紀錄，可以到「我的帳號」
                    {'>'}「歷史紀錄」跟「聲譽分數」的頁面中做查詢。
                </p>
            </section>
            <section className="space-y-4">
                {[...notifications].reverse().map((notification) => (
                    <NotificationItem
                        key={notification.id}
                        id={notification.id}
                    />
                ))}
            </section>
        </div>
    )
}

export default NotificationPage
