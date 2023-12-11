import '@testing-library/jest-dom'
import { MemoryRouter } from 'react-router-dom'
import { expect } from '@jest/globals'
import { render, screen } from '@testing-library/react'
import { UserProvider } from '../../contexts/User'
import Login from '../../pages/Login'

jest.mock('@uidotdev/usehooks', () => ({
    useMediaQuery: jest.fn().mockReturnValue(true),
    useIsFirstRender: jest.fn().mockReturnValue(false),
}))

test('Login should render', () => {
    render(
        <MemoryRouter>
            <UserProvider>
                <Login />
            </UserProvider>
        </MemoryRouter>
    )
    // @ts-ignore
    expect(screen.getByAltText('UniRep Logo')).toBeInTheDocument()
    // @ts-ignore
    expect(screen.getByText('Unirep Social TW')).toBeInTheDocument()

    // ... Add more tests as needed ...
})
