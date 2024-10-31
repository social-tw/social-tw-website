export function addRejectedReport(userId: string, reportId: string) {
    const key = `${userId}_rejectedReports`
    const currentRejectedPosts = JSON.parse(localStorage.getItem(key) || '[]')

    if (!currentRejectedPosts.includes(reportId)) {
        currentRejectedPosts.push(reportId)
        localStorage.setItem(key, JSON.stringify(currentRejectedPosts))
    }
}

export function getRejectedReports(userId: string) {
    const key = `${userId}_rejectedReports`
    return JSON.parse(localStorage.getItem(key) || '[]')
}

export function removeRejectedReport(userId: string, reportId: string) {
    const key = `${userId}_rejectedReports`
    let currentRejectedPosts = JSON.parse(localStorage.getItem(key) || '[]')

    currentRejectedPosts = currentRejectedPosts.filter(
        (id: string) => id !== reportId,
    )
    localStorage.setItem(key, JSON.stringify(currentRejectedPosts))
}

export function isReportRejected(userId: string, reportId: string) {
    const key = `${userId}_rejectedReports`
    const currentRejectedPosts = JSON.parse(localStorage.getItem(key) || '[]')
    return currentRejectedPosts.includes(reportId)
}
