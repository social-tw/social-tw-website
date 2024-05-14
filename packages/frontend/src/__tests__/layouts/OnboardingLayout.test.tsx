import '@testing-library/jest-dom'
import { render } from '@testing-library/react'
import OnboardingLayout from '@/layouts/OnboardingLayout'
import { wrapper } from '@/utils/test-helpers'

test('OnboardingLayout should render', () => {
    render(<OnboardingLayout />, { wrapper })
})
