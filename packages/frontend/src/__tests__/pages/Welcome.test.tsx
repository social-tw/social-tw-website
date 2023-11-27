import { expect } from '@jest/globals'
import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { UserProvider } from '../../contexts/User'
import { Welcome } from '../../pages/Welcome'

jest.mock('@uidotdev/usehooks', () => ({
    useMediaQuery: jest.fn().mockReturnValue(true),
    useIsFirstRender: jest.fn().mockReturnValue(false),
}))

test('Welcome should render', () => {
    render(
        <MemoryRouter>
            <UserProvider>
                <Welcome />
            </UserProvider>
        </MemoryRouter>
    )
    // @ts-ignore
    expect(screen.getByAltText('UniRep Logo')).toBeInTheDocument()
    // @ts-ignore
    expect(screen.getByText('Unirep Social TW')).toBeInTheDocument()

    // ... Add more tests as needed ...
})
