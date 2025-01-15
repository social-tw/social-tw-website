export default function ReportContent({ content }: { content?: string }) {
    return (
        <div className="pt-3">
            <div className="relative rounded-lg bg-dark-gradient h-36">
                <h3 className="absolute px-2 py-1 text-sm font-bold text-white rounded-lg -top-3 left-4 bg-dark-gradient">
                    被檢舉之內容
                </h3>
                <div className="h-full p-4 pt-5 overflow-auto">
                    <p className="text-sm font-medium leading-relaxed tracking-wider text-white md:leading-slightly-loose whitespace-break-spaces">
                        {content ? content : '無法加載內容'}
                    </p>
                </div>
            </div>
        </div>
    )
}
