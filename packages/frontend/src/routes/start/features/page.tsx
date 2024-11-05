import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import FirstImg from '@/assets/img/featureIntroduction/first-step.png'
import SecondImg from '@/assets/img/featureIntroduction/second-step.png'
import ThirdImg from '@/assets/img/featureIntroduction/third-step.png'
import FinalImg from '@/assets/img/featureIntroduction/final-step.png'
import { RiCloseFill } from 'react-icons/ri'
import { FaArrowLeftLong, FaArrowRightLong } from 'react-icons/fa6'

function FirstSection() {
    return (
        <>
            <div>
                <img
                    loading='lazy'
                    src={FirstImg}
                    className='object-contain self-end aspect-square w-60'
                    alt='first'
                />
            </div>
            <h1 className='mt-8 text-base font-bold'>
                在 Unirep Social Taiwan 你可以...
            </h1>
            <h2 className='self-stretch mt-2.5 text-2xl font-bold text-nowrap'>
                擁抱言論自由，沒有身份束縛
            </h2>
            <p className='mt-7 text-sm tracking-wide leading-6'>
                透過 Web3
                技術，替你保持匿名，無懼身份曝光，隨時參與討論，體驗真正的言論自由！
            </p>
        </>
    )
}

function SecondSection() {
    return (
        <>
            <div>
                <img
                    loading='lazy'
                    src={SecondImg}
                    className='object-contain self-end aspect-square w-60'
                    alt='second'
                />
            </div>
            <h1 className='mt-8 text-base font-bold'>
                在 Unirep Social Taiwan 你可以...
            </h1>
            <h2 className='self-stretch mt-2.5 text-2xl font-bold text-nowrap'>
                建立社群信任，匿名也有秩序
            </h2>
            <p className='mt-7 text-sm tracking-wide leading-6'>
                即使在匿名環境中，平台的聲譽系統能確保用戶行為正當，由用戶共同維護平台的健康運作！
            </p>
        </>
    )
}

function ThirdSection() {
    return (
        <>
            <div>
                <img
                    loading='lazy'
                    src={ThirdImg}
                    className='object-contain self-end aspect-square w-60'
                    alt='third'
                />
            </div>
            <h1 className='mt-8 text-base font-bold'>
                在 Unirep Social Taiwan 你可以...
            </h1>
            <h2 className='self-stretch mt-2.5 text-2xl font-bold text-nowrap'>
                享有加密技術，保護你的隱私
            </h2>
            <p className='mt-7 text-sm tracking-wide leading-6'>
                隱私至上，Unirep Social
                Taiwan使用區塊鏈加密技術，確保你的隱私和數據安全。
            </p>
        </>
    )
}

interface FinalSectionProps {
    countdown: number
}

function FinalSection({ countdown }: FinalSectionProps) {
    return (
        <>
            <h2 className='self-stretch mt-2.5 text-2xl font-bold'>
                歡迎你加入
                <br />
                Unirep Social Taiwan
                <br />
                一同打造安全的匿名社群！
            </h2>
            <div>
                <img
                    loading='lazy'
                    src={FinalImg}
                    className='object-contain self-end aspect-square w-60'
                    alt='final'
                />
            </div>
            <p className='mt-7 text-sm tracking-wide leading-6'>
                {`（${countdown} 秒後將自動前往註冊/登入頁面）`}
            </p>
        </>
    )
}

interface FooterProps {
    currentStep: number
    onNext: () => void
    onPrev: () => void
}

function Footer({ currentStep, onNext, onPrev }: FooterProps) {
    const items = [1, 2, 3, 4]
    return (
        <footer className='flex justify-between items-center gap-2 w-full text-center mt-12'>
            <FaArrowLeftLong
                onClick={onPrev}
                className='flex-1 cursor-pointer hover:text-gray-500'
            />
            {items.map((item, index) => (
                <div
                    key={index}
                    className={`h-2 flex-1 shadow ${
                        item === currentStep ? 'bg-secondary' : 'bg-white'
                    }`}
                />
            ))}
            <FaArrowRightLong
                onClick={onNext}
                className='flex-1 cursor-pointer hover:text-gray-500'
            />
        </footer>
    )
}

export default function FeaturesPage() {
    const [step, setStep] = useState<number>(1)
    const [countdown, setCountdown] = useState<number>(5)
    const navigate = useNavigate()

    const onClick = () => {
        navigate('/launch')
    }

    const onNext = () => {
        setStep((prevStep) => (prevStep < 4 ? prevStep + 1 : prevStep))
    }

    const onPrev = () => {
        setStep((prevStep) => (prevStep > 1 ? prevStep - 1 : prevStep))
    }

    useEffect(() => {
        if (step === 4) {
            const timer = setInterval(() => {
                setCountdown((prevCountdown) => {
                    if (prevCountdown <= 1) {
                        navigate('/welcome')
                        clearInterval(timer)
                        return 0
                    }
                    return prevCountdown - 1
                })
            }, 1000)
            return () => clearInterval(timer)
        } else {
            setCountdown(5)
        }
    }, [step, navigate])

    const renderSection = () => {
        switch (step) {
            case 1:
                return <FirstSection />
            case 2:
                return <SecondSection />
            case 3:
                return <ThirdSection />
            case 4:
                return <FinalSection countdown={countdown} />
            default:
                return <FirstSection />
        }
    }

    return (
        <main className='w-screen h-screen flex flex-col justify-center items-center gap-2 px-10'>
            <section className='max-w-[342px] bg-custom-gradient flex flex-col px-4 pb-12 pt-24 w-full rounded-3xl shadow-[0px_0px_40px_rgba(0,0,0,0.2)] justify-between items-center text-center bg-opacity-50 relative'>
                {renderSection()}
                <Footer currentStep={step} onNext={onNext} onPrev={onPrev} />
                <button
                    onClick={onClick}
                    className='p-1 rounded-full hover:bg-gray-200 focus:outline-none bg-white absolute top-3 right-3'
                >
                    <RiCloseFill className='w-4 h-4 text-gray-700' />
                </button>
            </section>
        </main>
    )
}
