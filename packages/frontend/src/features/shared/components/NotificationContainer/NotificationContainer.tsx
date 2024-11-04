export default function NotificationContainer({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div
            id="notifications"
            className="fixed z-20 right-4 bottom-28 lg:left-10 lg:right-auto lg:bottom-20"
        >
            {children}
        </div>
    )
}
