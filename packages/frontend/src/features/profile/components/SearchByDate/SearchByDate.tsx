import { DatePicker } from '@/features/shared'
import { ReactNode } from 'react'
import SearchBtn from './SearchBtn'
import { SetPast30DaysBtn, SetPast7DaysBtn, SetTodayBtn } from './SetDateBtn'

export default function SearchByDate() {
    return (
        <Wrapper>
            <RowWrapper>
                <Group>
                    <Label name="紀錄查詢日期區間" />
                    <RowWrapper>
                        <DatePicker />
                        <SearchBtn disabled={false} />
                    </RowWrapper>
                </Group>
            </RowWrapper>
            <RowWrapper>
                <Group>
                    <Label name="快捷選項" />
                    <RowWrapper>
                        <SetTodayBtn />
                        <SetPast7DaysBtn />
                        <SetPast30DaysBtn />
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
