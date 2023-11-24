import dayjs from "dayjs";

export default function formatDate(date: number | string | Date) {
    const publishedTime = dayjs(date)
    return publishedTime.isBefore(dayjs(), 'day')
        ? publishedTime.format('YYYY/MM/DD')
        : publishedTime.fromNow()
}
