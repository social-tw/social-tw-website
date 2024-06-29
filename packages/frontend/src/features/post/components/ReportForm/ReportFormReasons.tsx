import { useMemo, useState } from 'react'
import {
    FieldErrors,
    FieldValues,
    UseFormGetValues,
    UseFormRegister,
    UseFormSetValue,
    UseFormTrigger,
} from 'react-hook-form'
import { IoIosArrowDown, IoIosArrowUp } from 'react-icons/io'
import {
    ReportFormStepContent,
    ReportFormStepErrorHint,
} from './ReportFormStep'

class Option {
    constructor(
        public value: number,
        public label: string,
    ) {}
}

interface ReportFormReasonsProps {
    register: UseFormRegister<FieldValues>
    errors: FieldErrors<FieldValues>
    setValue: UseFormSetValue<FieldValues>
    getValues: UseFormGetValues<FieldValues>
    trigger: UseFormTrigger<FieldValues>
}

interface OptionControllerProps {
    option: Option
    isShowingOptionCtn: boolean
    onClick: () => void
}

interface OptionContainerProps {
    children: React.ReactNode
}

interface OptionItemProps {
    option: Option
    onClick: (option: Option) => void
}

export const REGISTER_ID = 'reason'

export function ReportFormReasons({
    register,
    errors,
    setValue,
    getValues,
    trigger,
}: ReportFormReasonsProps) {
    register(REGISTER_ID, { required: true, validate: getValidate() })

    const [selected, setSelected] = useState<Option>(
        getDefaultOption(getValues(REGISTER_ID)),
    )
    const [isShowingOptionCtn, setIsShowingOptionCtn] = useState(false)

    const options = useMemo(() => getOptions(), [])

    const onSelectOption = (option: Option) => {
        setSelected(option)
        setIsShowingOptionCtn(false)
        setValue(REGISTER_ID, option.value)
        trigger(REGISTER_ID)
    }

    const onToggleOptionCtn = () => {
        setIsShowingOptionCtn(!isShowingOptionCtn)
    }

    const hasError = errors[REGISTER_ID]

    return (
        <ReportFormStepContent>
            <OptionController
                option={selected}
                isShowingOptionCtn={isShowingOptionCtn}
                onClick={onToggleOptionCtn}
            />
            {isShowingOptionCtn && (
                <OptionContainer>
                    {options.map((option) => (
                        <OptionItem
                            key={option.value}
                            option={option}
                            onClick={onSelectOption}
                        />
                    ))}
                </OptionContainer>
            )}
            {hasError && <ReportFormStepErrorHint msg={'此為必選欄位'} />}
        </ReportFormStepContent>
    )
}

function OptionController({
    option,
    isShowingOptionCtn,
    onClick,
}: OptionControllerProps) {
    const textColor = option.value === -1 ? 'text-gray-400' : 'text-black'
    const icon = isShowingOptionCtn ? <IoIosArrowUp /> : <IoIosArrowDown />
    return (
        <div
            data-testid="option-controller"
            className={`${textColor} flex gap-2 items-center justify-between p-4 rounded-lg bg-white border border-gray-300 cursor-pointer`}
            onClick={onClick}
        >
            <div className="flex gap-1 flex-grow max-w-[90%]">
                {option.value !== -1 ? <div>{option.value}.</div> : null}
                <div className="w-full overflow-hidden whitespace-nowrap text-ellipsis">
                    {option.label}
                </div>
            </div>
            <div className="flex-shrink-1">{icon}</div>
        </div>
    )
}

function OptionContainer({ children }: OptionContainerProps) {
    return (
        <div
            data-testid="option-container"
            className="z-10 max-h-[200px] overflow-y-scroll mt-1 flex flex-col gap-2 absolute border border-gray-300 bg-white py-4 px-2 rounded-lg"
        >
            {children}
        </div>
    )
}

function OptionItem({ option, onClick }: OptionItemProps) {
    return (
        <div
            className="flex gap-2 hover:bg-[#FF892A] hover:bg-opacity-30 p-2 rounded-[4px] cursor-pointer"
            onClick={() => onClick(option)}
        >
            <div>{option.value}.</div>
            <div>{option.label}</div>
        </div>
    )
}

function getDefaultOption(index: number) {
    return index <= 0
        ? new Option(-1, '請選擇檢舉原因')
        : getOptions()[index - 1]
}

function getOptions() {
    return [
        new Option(
            1,
            '對使用者、特定個人、組織或群體發表中傷、歧視、挑釁、羞辱、謾罵、不雅字詞或人身攻擊等言論',
        ),
        new Option(
            2,
            '張貼商業廣告內容與連結、邀請碼或內含個人代碼的邀請連結等',
        ),
        new Option(
            3,
            '張貼色情裸露、性暗示意味濃厚的內容，惟內容具教育性者不在此限',
        ),
        new Option(4, '違反政府法令之情事'),
        new Option(5, '重複張貼他人已發表過且完全相同的內容'),
        new Option(6, '文章內容空泛或明顯無意義內容'),
        new Option(7, '其他'),
    ]
}

function getValidate() {
    return { positive: (x: number) => x > 0 }
}
