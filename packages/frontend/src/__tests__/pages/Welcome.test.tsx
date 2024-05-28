import { render, screen } from '@testing-library/react'
import { Welcome } from '@/pages/Welcome'
import { wrapper } from '@/utils/test-helpers/wrapper'

jest.mock('../../pages/Home/HomePostList', () => ({
    __esModule: true,
    default: () => <div>Mocked PostList</div>,
}))

jest.mock('../../pages/Welcome/ExamplePostsList', () => ({
    __esModule: true,
    default: () => <div>Mocked PostList</div>,
}))

test('Welcome should render', async () => {
    render(<Welcome />, { wrapper })
    await screen.findByAltText('UniRep Logo')
    await screen.findByText('Unirep Social TW')
})
