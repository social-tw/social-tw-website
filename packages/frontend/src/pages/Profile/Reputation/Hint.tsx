const CONTENT =
    '為維護匿名平台的抗審查及自治特性，Reputation 代表著您在此平台上的信用分數，每位用戶在註冊時的分數都為０，當分數為負數時，平台將限制您的行為使您無法發文、留言、投票，若希望提高分數，請參閱平台政策。此分數受您的在平台上的行為所影響，若您受到他人檢舉，並且檢舉被判斷為有效時，您將會被扣分；若您檢舉他人成功、或是幫助平台裁定檢舉，您將會被加分。平台方保有最終解釋權'

export const Hint = () => {
    return (
        <div className={`bg-white text-black p-8 rounded-xl leading-8`}>
            {CONTENT}
        </div>
    )
}
