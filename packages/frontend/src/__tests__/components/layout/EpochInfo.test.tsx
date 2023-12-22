import '@testing-library/jest-dom'
import EpochInfo from '@/components/layout/EpochInfo'
import { render, screen } from '@testing-library/react'

jest.mock('@/contexts/User', () => ({
    useUser: () => ({
        userState: {
            sync: {
                calcEpochRemainingTime: jest.fn().mockReturnValue(100),
                calcCurrentEpoch: jest.fn().mockReturnValue(9999),
            },
        },
    }),
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
            screen.getByText('目前動作次數(3次內)可確保匿名身份不被洩漏')
        ).toBeInTheDocument()
    })
})
