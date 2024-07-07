import { ReactNode } from 'react'
import { SearchByDate } from '../SearchByDate'

export default function ReputationHistory() {
    return (
        <Wrapper>
            <SearchByDate />
        </Wrapper>
    )
}

function Wrapper({ children }: { children: ReactNode }) {
    return <div className={`mb-8`}>{children}</div>
}
