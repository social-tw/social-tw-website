import { DatePicker } from '@/features/shared'
import { ReactNode } from 'react'
import SearchBtn from './SearchBtn'
import { SetPast30DaysBtn, SetPast7DaysBtn, SetTodayBtn } from './SetDateBtn'

interface SearchByDateProps {
    startDate: Date | undefined
    endDate: Date | undefined
    isDateSelected: boolean
    onChange: (dates: any) => void
    onClickSearch: () => void
    setToday: () => void
    setPast7Days: () => void
    setPast30Days: () => void
}

export interface DateRange {
    startDate: Date | undefined
    endDate: Date | undefined
}

export default function SearchByDate({
    startDate,
    endDate,
    isDateSelected,
    onChange,
    onClickSearch,
    setToday,
    setPast7Days,
    setPast30Days,
}: SearchByDateProps) {
    return (
        <Wrapper>
            <RowWrapper>
                <Group>
                    <Label name="紀錄查詢日期區間" />
                    <RowWrapper>
                        <DatePicker
                            startDate={startDate}
                            endDate={endDate}
                            isDateSelected={isDateSelected}
                            onChange={onChange}
                        />
                        <SearchBtn
                            disabled={!isDateSelected}
                            onClick={onClickSearch}
                        />
                    </RowWrapper>
                </Group>
            </RowWrapper>
            <RowWrapper>
                <Group>
                    <Label name="快捷選項" />
                    <RowWrapper>
                        <SetTodayBtn onClick={setToday} />
                        <SetPast7DaysBtn onClick={setPast7Days} />
                        <SetPast30DaysBtn onClick={setPast30Days} />
                    </RowWrapper>
                </Group>
            </RowWrapper>
        </Wrapper>
    )
}

function Wrapper({ children }: { children: ReactNode }) {
    return <div className={`flex flex-col gap-8`}>{children}</div>
}

function RowWrapper({ children }: { children: ReactNode }) {
    return <div className={`flex flex-row gap-4 w-full`}>{children}</div>
}

function Group({ children }: { children: ReactNode }) {
    return <div className={`flex flex-col gap-2 w-full`}>{children}</div>
}

function Label({ name }: { name: string }) {
    return <div className={`text-sm text-white`}>{name}</div>
}
