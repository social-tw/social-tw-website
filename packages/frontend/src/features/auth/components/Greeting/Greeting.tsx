import LogoWhite from '@/assets/img/logo-white.png'
import { useMediaQuery } from '@uidotdev/usehooks'

export default function Greeting() {
    const isMobile = useMediaQuery('only screen and (max-width : 768px)')

    if (isMobile) {
        return (
            <div className="flex flex-col mt-24 text-2xl font-semibold tracking-wider text-white">
                <p>歡迎來到</p>
                <p>Unirep Social TW！</p>
            </div>
        )
    }
    return (
        <div className="flex flex-col items-center justify-center pt-24">
            <img
                src={LogoWhite}
                alt="UniRep Logo"
                className="w-[7.5rem] mb-2"
            />
            <h1 className="text-2xl font-semibold text-neutral-200">
                Unirep Social TW
            </h1>
            <p className="text-sm font-light tracking-wider text-center text-white mt-9">
                嗨 🙌🏻 歡迎來到 Unirep Social TW <br />
                提供你 100% 匿名身份、安全發言的社群！
            </p>
        </div>
    )
}
