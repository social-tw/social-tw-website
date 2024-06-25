export function useReportPost() {
    const report = async (data: any) => {
        console.log('call report post api with data: ', data)
        await new Promise((resolve, reject) => setTimeout(resolve, 1000))
        console.log('pretend successful report')
    }
    return { report }
}
