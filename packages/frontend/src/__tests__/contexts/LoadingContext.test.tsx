import React from 'react'
import { render, act } from '@testing-library/react'
import {
    LoadingProvider,
    useLoading,
    LoadingStatus,
} from '../../contexts/LoadingContext'
import '@testing-library/jest-dom'

describe('LoadingProvider', () => {
    it('provides the loading status value', () => {
        const TestComponent: React.FC = () => {
            const { status } = useLoading()
            return <div>{status}</div>
        }

        const { getByText } = render(
            <LoadingProvider>
                <TestComponent />
            </LoadingProvider>
        )

        // @ts-ignore
        expect(getByText('loading')).toBeInTheDocument()
    })

    it('allows updating the loading status', () => {
        const TestComponent: React.FC = () => {
            const { status, setStatus } = useLoading()

            return (
                <div>
                    <div>{status}</div>
                    <button onClick={() => setStatus('success')}>
                        Update Status
                    </button>
                </div>
            )
        }

        const { getByText, getByRole } = render(
            <LoadingProvider>
                <TestComponent />
            </LoadingProvider>
        )

        // init loading
        // @ts-ignore
        expect(getByText('loading')).toBeInTheDocument()

        // update status success
        act(() => {
            getByRole('button').click()
        })

        // @ts-ignore
        expect(getByText('success')).toBeInTheDocument()
    })
})
