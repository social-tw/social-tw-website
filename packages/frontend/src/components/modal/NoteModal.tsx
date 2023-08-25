import React from 'react'
import { IconType } from 'react-icons'
import Modal from './Modal'

interface NoteModallProps {
    noteStatus: string
    icon: IconType
    onClose: () => void
}

const NoteModal: React.FC<NoteModallProps> = ({
    noteStatus,
    icon: Icon,
    onClose,
}) => {
    let content

    switch (noteStatus) {
        case 'metamask':
            content = (
                <>
                    <p className="underline font-semibold">
                        什麼是 MetaMask 錢包？
                    </p>
                    <p>
                        MetaMask
                        是一個以太坊（Ethereum）區塊鏈上的加密貨幣錢包和瀏覽器擴展程式，為用戶提供了方便的加密貨幣管理和去中心化應用（DApps）訪問。使用者能夠透過
                        MetaMask
                        在網頁瀏覽器中安全地存儲、管理和交易以太幣（ETH）及其他基於以太坊的代幣。
                    </p>
                    <p>
                        MetaMask
                        不僅僅是一個安全的錢包，它還是一個將區塊鏈技術融入日常網頁使用的工具。使用者可以透過
                        MetaMask
                        輕鬆地訪問各種去中心化應用，例如賭博平台、藝術品市場、去中心化金融服務等。MetaMask
                        通過助記詞和私鑰的方式，確保使用者對其資產擁有完全控制，同時也提供了在不同以太坊網絡之間切換的便利性。
                    </p>
                    <p>
                        MetaMask
                        在以太坊生態系中扮演著重要角色，為使用者提供了便捷的加密貨幣管理手段，同時也促進了去中心化應用的普及和使用。無論是初次接觸區塊鏈世界的新手，還是資深的加密貨幣愛好者，MetaMask
                        都是一個不可或缺的工具。
                    </p>
                </>
            )
            break
        case 'server':
            content = (
                <>
                    <p className="underline font-semibold">
                        甚麼是 Server 註冊？
                    </p>
                    <p>
                        如果您並未安裝 Metamask 錢包，我們提供 Server
                        註冊幫助您解決這項問題。
                    </p>
                    <p>
                        使用 Server
                        註冊將允許我們使用伺服器進行鍊上簽名，並進行註冊動作，放心一切資訊一樣會是匿名的。
                    </p>
                </>
            )
            break
    }
    return (
        <Modal isOpen={noteStatus !== 'close'}>
            <div className="flex flex-col justify-center items-center h-full p-4">
                <div className="relative p-12 flex flex-col gap-4 bg-white max-w-[600px] overflow-auto leading-7 tex-[15px] tracking-wider rounded-lg">
                    <Icon
                        className="absolute right-12 cursor-pointer"
                        size={24}
                        onClick={onClose}
                    />
                    {content}
                </div>
            </div>
        </Modal>
    )
}

export default NoteModal
