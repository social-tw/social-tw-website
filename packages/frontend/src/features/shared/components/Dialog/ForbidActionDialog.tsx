import Dialog from './Dialog'

export function ForbidActionDialog() {
    return (
        <Dialog isOpen={true} onClose={() => {}}>
            <div className="px-6 py-12 md:px-12 flex flex-col gap-6">
                <div>親愛的用戶：</div>
                <div className="leading-loose">
                    您的<span className="text-[#FF892A]">聲譽分數低於0</span>
                    ，因此您的使用行為權限受到一些限制，您無法進行以下的行動：
                    <br />
                    1. 發佈貼文
                    <br />
                    2. 評論留言
                    <br />
                    3. 按讚、倒讚
                    <br />
                    4. 檢舉貼文與留言
                </div>
                <div>
                    您可以透過
                    <span className="text-[#FF892A]">「每日簽到活動」</span>
                    來提高您的聲譽分數，以恢復使用行為權限。感謝您的理解！
                </div>
            </div>
        </Dialog>
    )
}
