import { wrapper } from '@/utils/test-helpers/wrapper'
import { render, screen } from '@testing-library/react'
import AdjudicationForm from './AdjudicationForm'

describe('AdjudicationForm', () => {
    it('should render the form', async () => {
        render(<AdjudicationForm />, { wrapper })

        const component = await screen.findByTestId('adjudication-form')
        expect(component).toBeInTheDocument()
    })
})
