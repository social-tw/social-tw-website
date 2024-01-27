import dayjs from 'dayjs'

export default function formatDate(date: number | string | Date): string {
    let dateToFormat = typeof date === 'string' ? parseInt(date, 10) : date

    const publishedTime = dayjs(dateToFormat)

    return publishedTime.isBefore(dayjs(), 'day')
        ? publishedTime.format('YYYY/MM/DD')
        : publishedTime.fromNow()
}
