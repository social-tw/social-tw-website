import '@testing-library/jest-dom'
import { render, waitFor, screen } from '@testing-library/react'
import { Welcome } from '@/pages/Welcome'
import { wrapper } from '@/utils/test-helpers'

jest.mock('../../pages/Home/HomePostList', () => ({
    __esModule: true,
    default: () => <div>Mocked PostList</div>,
}))

jest.mock('../../pages/Welcome/ExamplePostsList', () => ({
    __esModule: true,
    default: () => <div>Mocked PostList</div>,
}))

test('Welcome should render', () => {
    render(<Welcome />, { wrapper })
    waitFor(() => {
        expect(screen.getByAltText('UniRep Logo')).toBeInTheDocument()
        expect(screen.getByText('Unirep Social TW')).toBeInTheDocument()
        // ... Add more tests as needed ...
    })
})
