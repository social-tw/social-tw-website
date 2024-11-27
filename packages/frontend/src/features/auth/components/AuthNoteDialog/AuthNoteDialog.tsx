import Dialog from '@/features/shared/components/Dialog/Dialog'
import { IconType } from 'react-icons'

interface NoteModallProps {
    noteStatus: string
    icon: IconType
    onClose: () => void
}

export default function AuthNoteDialog({
    noteStatus,
    icon: Icon,
    onClose,
}: NoteModallProps) {
    let content

    switch (noteStatus) {
        case 'metamask':
            content = (
                <>
                    <p className="underline underline-offset-4">
                        什麼是 MetaMask 錢包？
                    </p>
                    <p>
                        MetaMask
                        是一個以太坊（Ethereum）區塊鏈上的加密貨幣錢包和瀏覽器擴展程式，為用戶提供了方便的加密貨幣管理和去中心化應用（DApps）訪問。使用者能夠透過
                        MetaMask
                        在網頁瀏覽器中安全地存儲、管理和交易以太幣（ETH）及其他基於以太坊的代幣。
                    </p>
                    <p>
                        選擇「錢包註冊」將會使用 MetaMask
                        來建立您的帳戶，以確保您的數據安全並讓您享有完全的數位資產管理權限。此方式適合已經擁有加密錢包或希望自行管理身份與數據的用戶。
                    </p>
                </>
            )
            break
        case 'server':
            content = (
                <>
                    <p className="underline underline-offset-4">
                        甚麼是 Server 註冊？
                    </p>
                    <p>
                        Server
                        註冊是一種簡便的註冊方式，不需要用戶擁有或管理自己的加密錢包。選擇
                        Server 註冊後，平台將會使用一種名為 relayer
                        的服務來幫助您完成區塊鏈交易。
                    </p>
                    <p className="underline underline-offset-4">
                        Relayer 是什麼？
                    </p>
                    <p>
                        Relayer
                        是一個中介服務，用來協助用戶完成交易簽名和交易提交的工作。在
                        Server
                        註冊的情況下，當您執行操作（如發表內容或投票）時，平台上的
                        relayer
                        會代表您進行交易的簽名與上鏈，無需您自己直接進行。
                    </p>
                    <p className="underline underline-offset-4">
                        這樣的好處是什麼？
                    </p>
                    <p>
                        這樣的設計讓您無需持有加密貨幣或熟悉區塊鏈操作，即可輕鬆使用本平台的功能，同時享有區塊鏈的安全性和透明性。這對於不熟悉加密技術的新用戶非常友好，也減少了進入門檻。
                    </p>
                </>
            )
            break
    }

    return (
        <Dialog isOpen={noteStatus !== 'close'} onClose={onClose}>
            <div className="flex flex-col gap-4 p-12 overflow-auto text-base font-light leading-7 tracking-wider text-black rounded-lg">
                {content}
            </div>
        </Dialog>
    )
}
