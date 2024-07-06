export enum ReportCategory {
    Aggression = 1,
    Solicitation = 2,
    Pornography = 3,
    Illegality = 4,
    Spam = 5,
    NonSense = 6,
    Other = 7,
}

export const REPORT_CATEGORY_LABELS: Record<ReportCategory, string> = {
    [ReportCategory.Aggression]:
        '對使用者、特定個人、組織或群體發表中傷、歧視、挑釁、羞辱、謾罵、不雅字詞或人身攻擊等言論',
    [ReportCategory.Solicitation]:
        '張貼商業廣告內容與連結、邀請碼或內含個人代碼的邀請連結等',
    [ReportCategory.Pornography]:
        '張貼色情裸露、性暗示意味濃厚的內容，惟內容具教育性者不在此限',
    [ReportCategory.Illegality]: '違反政府法令之情事',
    [ReportCategory.Spam]: '重複張貼他人已發表過且完全相同的內容',
    [ReportCategory.NonSense]: '文章內容空泛或明顯無意義內容',
    [ReportCategory.Other]: '其他',
}

export enum AdjudicateValue {
    Disagree = 0,
    Agree = 1,
}
