import dayjs from "dayjs";

export default function formatDate(date: Date) {
  const publishedTime = dayjs(new Date(date))
  return publishedTime.isBefore(dayjs(), 'day')
      ? publishedTime.format('YYYY/MM/DD')
      : publishedTime.fromNow()
}
