import React from 'react'
import { render, act, waitFor } from '@testing-library/react'
import { UserProvider, useUser } from '../../contexts/User'
import '@testing-library/jest-dom'
import { expect } from '@jest/globals'

it('provides context to children', () => {
    const TestComponent = () => {
        const userContext = useUser()
        expect(userContext).toBeTruthy() // or other specific checks
        return null
    }

    render(
        <UserProvider>
            <TestComponent />
        </UserProvider>,
    )
})

it('throws error when useUser is called outside of UserProvider', () => {
    const TestComponent = () => {
        expect(useUser).toThrowError(
            'useUser must be used within a UserProvider',
        )
        return null
    }

    render(<TestComponent />)
})
