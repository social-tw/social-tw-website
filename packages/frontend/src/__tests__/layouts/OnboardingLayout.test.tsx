import '@testing-library/jest-dom'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import OnboardingLayout from '../../layouts/OnboardingLayout'

test('OnboardingLayout should render', () => {
    render(
        <MemoryRouter>
            <OnboardingLayout />
        </MemoryRouter>,
    )
})
