import { render, screen } from '@testing-library/react'
import { useRouteError } from 'react-router-dom'
import ErrorBoundary from './ErrorBoundary'

// Mock the useRouteError hook from react-router-dom
jest.mock('react-router-dom', () => {
    return {
        // @ts-ignore
        ...jest.requireActual('react-router-dom'),
        useRouteError: jest.fn(),
    }
})

describe('<ErrorBoundary />', () => {
    it('displays the statusText of the error', () => {
        // Mock the hook to return a specific error
        // @ts-ignore
        ;(useRouteError as jest.Mock).mockReturnValue({
            status: 404,
            statusText: '404 Not Found',
            internal: true,
            data: {},
        })

        render(<ErrorBoundary />)

        // @ts-ignore
        expect(screen.getByText('404 Not Found')).toBeInTheDocument()
    })

    // Add more tests as needed for other scenarios or other parts of the component
})
