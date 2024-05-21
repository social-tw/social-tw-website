import { render, screen } from '@testing-library/react'
import { mockIntersectionObserver } from 'jsdom-testing-mocks'
import { wrapper } from '@/utils/test-helpers/wrapper'
import WelcomePage from './page'

mockIntersectionObserver()

test('WelcomePage should render', async () => {
    render(<WelcomePage />, { wrapper })
    await screen.findByAltText('UniRep Logo')
    await screen.findByText('Unirep Social TW')
})
