import { ReactComponent as ChatHexagonIcon } from '@/assets/svg/chat-hexagon.svg'
import { ReactComponent as ChatInfoIcon } from '@/assets/svg/chat-info.svg'
import { ReactComponent as ChatQuestionIcon } from '@/assets/svg/chat-question.svg'
import { ReactComponent as ChatStarIcon } from '@/assets/svg/chat-star.svg'
import { ReactComponent as DiscordIcon } from '@/assets/svg/discord.svg'
import { ReactComponent as GithubIcon } from '@/assets/svg/github.svg'
import {
    Disclosure,
    DisclosureButton,
    DisclosurePanel,
} from '@headlessui/react'
import { useEffect } from 'react'
import { LuChevronDown } from 'react-icons/lu'
import Markdown from 'react-markdown'
import { useSearchParams } from 'react-router-dom'

export default function AboutPage() {
    const [searchParams] = useSearchParams()
    const viewId = searchParams.get('viewId')

    useEffect(() => {
        const viewId = searchParams.get('viewId')
        if (!viewId) return
        const element = document.getElementById(viewId)
        if (!element) return
        element.scrollIntoView()
    }, [searchParams])

    return (
        <div className="px-4 pb-10 lg:pt-4 lg:px-0">
            <section className="py-4">
                <h2 className="flex items-center gap-2 mb-3 text-lg font-black tracking-wider text-white">
                    <ChatStarIcon className="w-5 h-5" />
                    平台特點與機制介紹
                </h2>
                <div className="space-y-4">
                    {features.map((feature, i) => (
                        <Collapse
                            key={i}
                            id={feature.id}
                            title={feature.title}
                            content={feature.content}
                            defaultOpen={feature.id === viewId}
                        />
                    ))}
                </div>
            </section>
            <section className="py-4">
                <h2 className="flex items-center gap-2 mb-3 text-lg font-black tracking-wider text-white">
                    <ChatInfoIcon className="w-5 h-5" />
                    平台政策
                </h2>
                <div className="space-y-4">
                    {policies.map((policy, i) => (
                        <Collapse
                            key={i}
                            id={policy.id}
                            title={policy.title}
                            content={policy.content}
                            defaultOpen={policy.id === viewId}
                        />
                    ))}
                </div>
            </section>
            <section className="py-4">
                <h2 className="flex items-center gap-2 mb-3 text-lg font-black tracking-wider text-white">
                    <ChatHexagonIcon className="w-5 h-5" />
                    開源資訊與 Discord 社群
                </h2>
                <div className="flex gap-4">
                    <a
                        className="btn btn-secondary no-animation"
                        href={githubLink}
                        target="_blank"
                        rel="noreferrer noopener"
                    >
                        <GithubIcon className="w-5 h-5" />
                        前往 Github
                    </a>
                    <a
                        className="btn btn-secondary no-animation"
                        href={discordLink}
                        target="_blank"
                        rel="noreferrer noopener"
                    >
                        <DiscordIcon className="w-5 h-5" />
                        前往 Discord
                    </a>
                </div>
            </section>
            <section className="py-4">
                <h2 className="flex items-center gap-2 mb-3 text-lg font-black tracking-wider text-white">
                    <ChatQuestionIcon className="w-5 h-5" />
                    常見問題
                </h2>
                <div className="space-y-4">
                    {faqs.map((faq) => (
                        <Collapse
                            key={faq.id}
                            title={faq.title}
                            content={faq.content}
                            defaultOpen={faq.id === viewId}
                        />
                    ))}
                </div>
            </section>
        </div>
    )
}

const githubLink = 'https://github.com/social-tw/social-tw-website'

const discordLink = 'https://discord.gg/TESq3vqc'

const features = [
    {
        id: 'feature-introduction',
        title: 'Unirep Social Taiwan 簡介',
        content: `
Unirep Social Taiwan 是一個去中心化的社交平台，強調用戶的隱私保護和社群自治。在這裡，用戶可以匿名參與討論，享受真正的言論自由，並透過聲譽系統維護社群秩序。平台利用區塊鏈技術，讓每個行為都與隨機生成的身份綁定，確保隱私安全。 
        `,
    },
    {
        id: 'feature-epoch',
        title: 'Epoch / Epoch Key / 動作操作計數區 ',
        content: `
### 「Epoch / Epoch Key」
在 Unirep Social Taiwan 社群平台上，每 5 分鐘為一個 Epoch（在區塊鏈或去中心化平台中，Epoch 是一段時間的單位），每個 Epoch 內使用者可使用 3 把 Epoch Keys （Epoch Key 是 UniRep 協議中的一種隨機生成的身份標示符，用來識別用戶在特定 Epoch 期間的行為）來執行各種操作，例如發文、投票、留言、檢舉和協助檢舉評判等。每個行為會使用到 1 把 Epoch Key。如果在 5 分鐘內進行超過 3 個操作，系統將重複使用已使用過的 Epoch Key，此時可能增加交叉比對的可行性，從而提高用戶身份被識別的風險。

### 「動作操作計數區」
此區塊為 Unirep Social Taiwan 特有的動作操作計數區塊，方便你快速辨識平台上的操作動作的相關資訊，以防止身份被辨識。此區塊提供每回 Epoch 的剩餘時間和操作行為次數，方便你快速辨識相關資訊。每當執行新操作時，計數區底部會顯示最新的操作行為，以及該操作的上鏈交易（Transaction）進度與狀態。上鏈交易（Transaction）是指將某一筆交易或動作記錄永久寫入區塊鏈的過程。
        `,
    },
    {
        id: 'feature-identity',
        title: '隨機身份',
        content: `
為保護你的隱私與身份，會在每個動作被執行時賦予你新的隨機身份（Random Identity）， 因此你的用戶頭像圖片會是隨機生成的，並且每次都不一樣。
        `,
    },
    {
        id: 'feature-reputation',
        title: '聲譽分數',
        content: `
### 「何謂聲譽分數？」
聲譽分數（Reputation Score）為用戶在 Unirep Social Taiwan 上的所有操作行為所獲得的分數，作為去中心化與用戶自治的機制。每位用戶的聲譽分數起始分數為 0，當用戶的分數為負分時，平台將限制該用戶的操作行為，該用戶無法進行發文、投票、留言、檢舉和協助檢舉評判，僅能進行瀏覽。
### 「如何提高聲譽分數？」
當你的聲譽分數不為負值時（大於等於 0），你可以透過以下 2 種方式提高聲譽分數：
- 進行內容檢舉
    檢舉不當內容的貼文或留言，若檢舉評判通過你可以提高 3 分聲譽分數
- 協助檢舉評判
    當你成功協助檢舉評判後，你可以提高 1 分聲譽分數
當你的聲譽分數為負值時（小於 0），你可以透過以下方式提高聲譽分數：
- 進行每日簽到
    平台會在聲譽分數為負值的用戶使用平台時提供「每日簽到」的按鈕，讓聲譽分數為負值的用戶能夠藉此提高聲譽分數。「每日簽到」按鈕每日僅提供一次簽到機會。
### 「何種情況聲譽分數會降低？」
有 2 種情況會使你的聲譽分數降低：
- 當你的貼文被檢舉，並且評判通過後，你的聲譽分數會被扣 5 分。
- 若你提出的檢舉案評判不通過時，你的聲譽分數會被扣 1 分。
        `,
    },
    {
        id: 'feature-community',
        title: '社群自治 / 檢舉 / 檢舉評判',
        content: `
### 「社群自治與檢舉機制」
Unirep Social Taiwan 為一去中心化的用戶自治管理平台，藉由透過檢舉不當內容的方式來維持社群的安全與健康。當一則「貼文」或是「留言」的內容有不當之處時，你可以進行對於該則內容的檢舉操作。當檢舉送出後，該檢舉將交由 Unirep Social Taiwan 中的 5 位隨機用戶進行檢舉內容的評判審核。若檢舉通過，你的聲譽分數將提高 3 分，若檢舉不通過，則您的聲譽分數會降低 3 分。
### 「檢舉評判機制」
當檢舉案件被成功上鏈交易後，該檢舉將交由 Unirep Social Taiwan 上的 5 位隨機用戶進行檢舉內容的評判審核，成功協助評判的用戶的聲譽分數將提高 1 分。
        `,
    },
]

const policies = [
    {
        id: 'policy-content',
        title: '內容規範',
        content: `
為保障用戶的隱私與自由表達，並維護平台的健康互動環境，我們致力於提供一個尊重個人權利、促進積極對話的社群空間。因此，為確保所有用戶能夠在安全且有序的環境中交流，請避免發佈以下類型的貼文或留言：
1. 發表針對個人、群體或組織的中傷、歧視、挑釁、羞辱或人身攻擊等言論。
2. 張貼商業廣告、邀請碼或包含個人代碼的邀請連結等內容。
3. 發佈帶有色情裸露、強烈性暗示的內容（具教育性質者除外）。
4. 違反政府法令的行為或內容。
5. 重複張貼他人已發佈過的相同內容。
6. 發佈空泛或明顯無意義的內容。
7. 任何其他被認定為有損社群秩序或不符合平台健康互動標準的內容。
若發佈上述內容，可能會被其他用戶檢舉，進而導致聲譽分數扣減，甚至限制您在平台上的操作行為。詳細資訊請參閱[社群自治 / 檢舉 / 檢舉評判](#feature-community)、[聲譽分數](#feature-reputation)。
        `,
    },
    {
        id: 'policy-disclaimer',
        title: '免責聲明',
        content: `
本社群平台致力於為用戶提供匿名、隱私保護且自由表達的社交空間。然而，使用者應對自己所發佈的內容及行為負全部責任。本平台不對用戶發佈的任何言論、內容或行為承擔法律責任。
1. 用戶行為責任
使用者發佈的任何內容，包括但不限於文字、圖片、連結，均應遵守本平台規範及當地法律法規。任何違反規定的內容，如中傷、歧視、侵權、違法行為等，將由發佈者個人負責。
2. 檢舉與聲譽分數影響
本平台設有檢舉機制，用戶之間可以檢舉不當內容。檢舉經評判後，可能導致發佈者的聲譽分數下降，並可能影響其在平台上的權限或操作行為。因聲譽分數扣減所引起的後果由用戶自行承擔。
3. 隱私與安全
我們致力於使用 Web3 技術和加密手段來保護用戶的隱私，但仍無法完全避免因技術限制或用戶行為導致的身份洩露風險。使用本平台時，請謹慎操作並避免在敏感操作中超出特定範圍的行為。
4. 免責條款
本平台對因使用本服務而引發的任何直接或間接損失不承擔責任。平台不對用戶之間的互動及其後果承擔任何責任。
通過使用 UniRep Social Taiwan 平台，即表示您同意並理解上述免責聲明內容及規範。如有疑問，請參閱完整平台說明。
        `,
    },
]

const faqs = [
    {
        id: 'faq-1',
        title: '為什麼需要透過 X 帳號註冊？',
        content: `
X 帳號僅用於驗證你是否為真實用戶，以防止大量假帳號帶來的女巫攻擊風險（女巫攻擊（Sybil Attack）是一種常見於去中心化系統中的攻擊方式，指的是攻擊者創建大量假帳號或身份，以此來操控系統或影響網絡中的決策），從而保護平台系統安全。Unirep Social Taiwan 不會取用你在 X 上的任何資訊。
        `,
    },
    {
        id: 'faq-2',
        title: '為什麼透過 X 帳號註冊後又有一個註冊？',
        content: `
透過 X 帳號註冊僅用於驗證您是否為真實用戶，而後的錢包註冊或伺服器註冊步驟，才是真正的在 UniRep Social Taiwan 上建立帳號。
        `,
    },
    {
        id: 'faq-3',
        title: '聲譽分數低於 0 分怎麼辦？',
        content: `
當你的聲譽分數低於 0 時，你可以透過進行「每日簽到」的方式來提高聲譽分數。Unirep Social Taiwan 平台會在聲譽分數為負值的用戶使用平台時提供「每日簽到」的按鈕，讓聲譽分數為負值的用戶能夠藉此提高聲譽分數。「每日簽到」按鈕每日僅提供一次簽到機會。
        `,
    },
    {
        id: 'faq-4',
        title: '可以透過不斷的檢舉來提高聲譽分數嗎？',
        content: `
在 Unirep Social Taiwan 的機制中，檢舉行為本身並不是用來無限制提高聲譽分數的手段。檢舉機制是設計來促進平台秩序和健康互動的。持續進行不正當或惡意檢舉，反而可能會損害用戶自身的聲譽分數。檢舉內容需要經過平台的「檢舉評判機制」來評估其有效性。只有在檢舉符合平台規範並且經過確認後，才有可能對聲譽分數產生積極影響。重複的無效檢舉則可能導致用戶聲譽分數下降，當聲譽分數為負值時其平台的操作行為將遭到限制。詳細資訊請參閱[社群自治 / 檢舉 / 檢舉評判](#feature-community)、[聲譽分數](#feature-reputation)
        `,
    },
    {
        id: 'faq-5',
        title: '我可以刪除我自己的貼文 / 留言嗎？',
        content: `
由於平台採用的技術架構，目前無法刪除已發佈的貼文或留言。因此，我們建議您在發佈內容時仔細考慮，確保內容合適並符合平台規範。
        `,
    },
]

function Collapse({
    id,
    title,
    content,
    defaultOpen = false,
}: {
    id?: string
    title?: string
    content?: string
    defaultOpen?: boolean
}) {
    return (
        <Disclosure
            as="div"
            id={id}
            className="scroll-mt-20 lg:scroll-mt-36"
            defaultOpen={defaultOpen}
        >
            <DisclosureButton className="justify-between group btn btn-block btn-secondary no-animation">
                {title}
                <LuChevronDown className="w-6 h-6 group-data-[open]:rotate-180" />
            </DisclosureButton>
            <DisclosurePanel>
                <Markdown className="p-4 prose text-white prose-h3:text-base prose-h3:leading-7 prose-p:leading-7 prose-a:text-secondary prose-a:font-bold">
                    {content}
                </Markdown>
            </DisclosurePanel>
        </Disclosure>
    )
}
