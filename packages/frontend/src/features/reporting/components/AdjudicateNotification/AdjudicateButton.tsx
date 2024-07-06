import { ReactComponent as ArrowRight } from '@/assets/svg/arrow-right.svg'
import { ReactComponent as GavelRaisedIcon } from '@/assets/svg/gavel-raised.svg'

export default function AdjudicationButton({
    onClick = () => {},
}: {
    onClick?: () => void
}) {
    return (
        <button
            className="relative py-2 pl-12 pr-2 bg-black border border-white rounded-tl-lg rounded-tr rounded-bl rounded-br-lg lg:py-3 lg:pr-4 lg:pl-14 drop-shadow"
            onClick={onClick}
        >
            <GavelRaisedIcon className="absolute bottom-0 -left-3 w-[4.5rem] lg:w-[5.25rem] h-auto" />
            <div className="inline-flex flex-col items-start">
                <span className="text-base font-bold leading-tight tracking-normal text-white lg:tracking-wider lg:text-lg">
                    新檢舉案出現
                </span>
                <span className="text-xs font-medium leading-tight text-white lg:text-sm">
                    <ArrowRight className="inline-block w-3 lg:w-auto mr-0.5 lg:mr-1" />
                    立即前往評判！
                </span>
            </div>
        </button>
    )
}
