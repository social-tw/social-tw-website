import {observer} from "mobx-react-lite";
import React from "react";
import User from "../contexts/User";
import Text from "../components/shared/Text";
import PostList from "../components/Postlist";
export default observer(() => {
    const userContext = React.useContext(User)

    const posts = [
        {
            text: "今天真是一個美好的日子！我終於完成了我夢寐以求的目標：跑完全馬拉松！這個挑戰對我來說真的非常艱巨，但我堅持下來了。在這個過程中，我學到了很多關於毅力和奮鬥的價值。我要特別感謝我的家人和朋友對我一直以來的支持和鼓勵。無論你們在生活中面對什麼困難，只要你們相信自己，付出努力，你們一定可以實現自己的目標！今天，我真心覺得自己是最幸運的人。",
            time: "3 小時前",
            timeLink: "#",
            comment: " 💬  1 則留言",
            commentLink: "#"
        },
        {
            text: "最近我剛看完一本非常棒的書，推薦給大家！這本書叫做《思考快與慢》，作者是丹尼爾·卡尼曼。這本書深入探討了人類思考的方式和偏見。它教會了我們如何辨識和避免那些常常影響我們判斷力的錯誤和陷阱。我學到了很多關於認知心理學的知識，這些知識不僅適用於個人生活，還能幫助我們在工作和人際關係中做出更明智的決策。如果你對心理學或者是提升自己的思考能力感興趣，這本書絕對是值得一讀的！",
            time: "4 小時前",
            timeLink: "#",
            comment: " 💬  6 則留言",
            commentLink: "#"
        },
        {
            text: "剛剛和一群好友一起參加了一場令人驚喜的音樂會！我們聽到了一位非常出色的音樂家演奏，他的技巧和激情真是讓人難以置信。音樂會的現場氣氛也非常棒，大家都在跟著節奏搖擺，沉浸在美妙的音樂中。音樂總是有種神奇的力量，它能夠觸動人心，帶給我們情緒的共鳴。這次音樂會真的讓我重新燃起對音樂的熱愛，我想以後會更積極地參加各種音樂活動。如果你也喜歡音樂，不妨多花時間去欣賞和體驗。",
            time: "4 小時前",
            timeLink: "#",
            comment: " 💬  4 則留言",
            commentLink: "#"
        },
    ];

    return (
        <>
            <div className={'h-screen-min w-full'}>
                <div className={'pl-16'}>
                    <Text text={'嗨  🙌🏻 歡迎來到 Unirep Social TW'} size={'text-4xl'} other={'font-semibold text-white'} />
                    <Text text={'提供你 100% 匿名身份、安全發言的社群！'} size={'text-4xl'} other={'font-semibold text-white'} />
                </div>
                <div className={'flex flex-row items-center justify-center pt-[118px] pb-[52px]'}>
                    <a href="/" className="underline text-blue-500 hover:text-blue-800">
                        <Text text={'登入'} size={'text-[28px]'} other={'font-medium text-white'} />
                    </a>
                    <Text text={'來提供你的想法吧！'} size={'text-[28px]'} other={'font-medium text-white'} />
                </div>
                <div className={'pb-[107px]'}>
                <PostList posts={posts} />
                </div>
            </div>
        </>
    )
})

