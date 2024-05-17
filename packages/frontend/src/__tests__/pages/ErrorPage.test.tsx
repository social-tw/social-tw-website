import { render, screen } from '@testing-library/react'
import ErrorPage from '../../pages/ErrorPage'
import { useRouteError } from 'react-router-dom'

// Mock the useRouteError hook from react-router-dom
jest.mock('react-router-dom', () => {
    return {
        // @ts-ignore
        ...jest.requireActual('react-router-dom'),
        useRouteError: jest.fn(),
    }
})

describe('<ErrorPage />', () => {
    it('displays the statusText of the error', () => {
        // Mock the hook to return a specific error
        // @ts-ignore
        ;(useRouteError as jest.Mock).mockReturnValue({
            message: 'A test error',
            statusText: '404 Not Found',
        })

        render(<ErrorPage />)

        // @ts-ignore
        expect(screen.getByText('404 Not Found')).toBeInTheDocument()
    })

    // Add more tests as needed for other scenarios or other parts of the component
})
