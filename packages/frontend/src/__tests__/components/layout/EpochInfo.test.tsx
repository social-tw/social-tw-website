import '@testing-library/jest-dom'
import EpochInfo from '@/components/layout/EpochInfo'
import { render, screen } from '@testing-library/react'

jest.mock('@/hooks/useEpoch', () => ({
    useEpoch: () => ({
        epochLength: 300,
        epoch: 1,
        epochStartTime: 0,
        epochEndTime: 300,
        remainingTime: 150,
    }),
}))

jest.mock('@/hooks/useActionCount', () => ({
    useActionCount: () => 1,
}))

describe('EpochInfo', () => {
    it('should display remaining time', () => {
        render(<EpochInfo />)

        expect(screen.getByTestId('epoch-remaining-time')).toBeInTheDocument()
    })

    it('should display action count indicator', () => {
        render(<EpochInfo />)

        expect(screen.getByTestId('action-counter')).toBeInTheDocument()
    })

    it('should display message', () => {
        render(<EpochInfo />)

        expect(
            screen.getByText('目前動作次數(3次內)可確保匿名身份不被洩漏'),
        ).toBeInTheDocument()
    })
})
