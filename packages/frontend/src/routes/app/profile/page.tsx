import EpochImg from '@/assets/img/epoch.png'
import { CyanButton, LogoutModal } from '@/features/auth'
import { useUserInfo } from '@/features/core'
import { useReputationScore } from '@/features/reporting'
import dayjs from 'dayjs'
import { useState } from 'react'
import {
    RiHourglassFill,
    RiLogoutBoxRLine,
    RiShieldStarLine,
    RiLoginBoxLine,
} from 'react-icons/ri'
import { useNavigate } from 'react-router-dom'

export default function ProfilePage() {
    return (
        <div className="px-4 py-8 space-y-8 lg:px-0">
            <div className="px-4 space-y-6">
                <ReputationInfo />
                <AccountInfo />
            </div>
            <div className="flex flex-col w-full gap-4 md:flex-row md:gap-5">
                <HistoryButton />
                <ReputationButton />
                <LogoutButton />
            </div>
        </div>
    )
}

function ReputationInfo() {
    const { reputationScore, isValidReputationScore } = useReputationScore()
    const score = reputationScore ?? 0
    const message = isValidReputationScore
        ? '您的聲譽分數良好，\n可以行使所有平台操作行為權利'
        : '您的聲譽分數為負值\n，行為權力已被限制'

    return (
        <div className="flex flex-wrap items-center justify-center gap-5">
            <img
                className="w-14 h-14 basis-14 shrink-0"
                src={EpochImg}
                alt="epoch actions"
            />
            <div className="flex items-center gap-2">
                <div className="text-sm font-bold tracking-widest text-white/90">
                    <div>聲譽</div>
                    <div>分數</div>
                </div>
                <div className="text-6xl font-black text-white/95">{score}</div>
            </div>
            <div className="space-y-1">
                <p className="text-sm font-bold tracking-wider text-center text-white/90 whitespace-break-spaces">
                    {message}
                </p>
                <p className="text-xs font-medium tracking-wider text-center text-white/60">
                    ＊聲譽分數會在每個 Epoch 開始時更新
                </p>
            </div>
        </div>
    )
}

function formatUserId(id: string) {
    return `${id.slice(0, 4)}...${id.slice(-4, id.length)}`
}

function formatDate(date: Date) {
    return dayjs(date).format('YYYY.MM.DD')
}

function AccountInfo() {
    const { data } = useUserInfo()
    const userId = data?.userId ? formatUserId(data.userId) : undefined
    const date = data?.signedUpDate ? formatDate(data.signedUpDate) : undefined

    return (
        <div className="space-y-1 text-sm font-bold tracking-wider text-center text-white/90">
            <p>User ID：{userId}</p>
            <p>帳號創辦日期：{date}</p>
        </div>
    )
}

function HistoryButton() {
    const navigate = useNavigate()

    const handleLogout = () => {
        navigate('/profile/history')
    }

    return (
        <CyanButton
            isLoading={false}
            onClick={handleLogout}
            title="歷史紀錄"
            icon={RiHourglassFill}
            start={true}
            size="lg"
            iconSize={24}
        />
    )
}

function ReputationButton() {
    const navigate = useNavigate()
    const handleLogout = () => {
        navigate('/profile/reputation')
    }
    return (
        <CyanButton
            isLoading={false}
            onClick={handleLogout}
            title="信譽分數"
            icon={RiShieldStarLine}
            start={true}
            size="lg"
            iconSize={24}
        />
    )
}

function LogoutButton() {
    const [isOpen, setIsOpen] = useState(false)
    return (
        <>
            <CyanButton
                isLoading={false}
                onClick={() => setIsOpen(true)}
                title="登出"
                icon={RiLogoutBoxRLine}
                start={true}
                size="lg"
                iconSize={24}
            />
            <LogoutModal isOpen={isOpen} closeModal={() => setIsOpen(false)} />
        </>
    )
}
