import { render } from '@testing-library/react'
import { wrapper } from '@/utils/test-helpers/wrapper'
import OnboardingLayout from './layout'

test('OnboardingLayout should render', () => {
    render(<OnboardingLayout />, { wrapper })
})
