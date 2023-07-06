import Avatar from 'boring-avatars'
import dayjs from 'dayjs'
import { ArrowDown, ArrowUp } from 'iconoir-react'

export default function ({
    epochKey,
    content = '',
    publishedAt = new Date(),
    commentCount = 0,
    upCount = 0,
    downCount = 0,
}: {
    epochKey: string
    content: string
    publishedAt: Date
    commentCount: number
    upCount: number
    downCount: number
}) {
    const publishedTime = dayjs(publishedAt)
    const publishedLabel = publishedTime.isBefore(dayjs(), 'day')
        ? publishedTime.format('YYYY/MM/DD')
        : publishedTime.fromNow()

    return (
        <article className="flex items-start gap-6">
            <section className="w-24 h-24">
                <div className="border-2 border-white rounded-full avatar">
                    <Avatar
                        size={80}
                        name={epochKey}
                        variant="beam"
                        colors={[
                            '#92A1C6',
                            '#146A7C',
                            '#F0AB3D',
                            '#C271B4',
                            '#C20D90',
                        ]}
                    />
                </div>
            </section>
            <div className="flex items-start gap-4 px-8 py-8 bg-white rounded-3xl">
                <section className="flex flex-col items-center">
                    <button className="btn btn-circle btn-ghost">
                        <ArrowUp strokeWidth={3} />
                    </button>
                    <span className="inline-flex items-center justify-center w-12 h-12 text-lg font-medium">
                        {upCount - downCount}
                    </span>
                    <button className="btn btn-circle btn-ghost">
                        <ArrowDown strokeWidth={3} />
                    </button>
                </section>
                <section>
                    <p className="text-2xl font-medium text-black break-all whitespace-pre-wrap">
                        {content}
                    </p>
                    <div className="flex justify-between mt-8">
                        <span className="text-2xl text-blue-300">
                            {publishedLabel}
                        </span>
                        <span className="text-2xl text-blue-300">
                            {commentCount} 則留言
                        </span>
                    </div>
                </section>
            </div>
        </article>
    )
}
