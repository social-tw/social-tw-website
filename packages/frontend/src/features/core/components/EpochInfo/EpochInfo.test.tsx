import { render, screen } from '@testing-library/react'
import { wrapper } from '@/utils/test-helpers/wrapper'
import EpochInfo from './EpochInfo'

describe('EpochInfo', () => {
    it('should display remaining time', () => {
        render(<EpochInfo />, { wrapper })

        expect(screen.getByTestId('epoch-remaining-time')).toBeInTheDocument()
    })

    it('should display action count indicator', () => {
        render(<EpochInfo />, { wrapper })

        expect(screen.getByTestId('action-counter')).toBeInTheDocument()
    })

    it('should display message', () => {
        render(<EpochInfo />, { wrapper })

        expect(
            screen.getByText('目前動作次數(3次內)可確保匿名身份不被交叉比對'),
        ).toBeInTheDocument()
    })
})
