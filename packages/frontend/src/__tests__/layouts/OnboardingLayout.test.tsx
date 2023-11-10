import React from 'react'
import { render, screen } from '@testing-library/react'
import OnboardingLayout from '../../layouts/OnboardingLayout'
import { UserProvider } from '../../contexts/User'
import '@testing-library/jest-dom'
import { MemoryRouter } from 'react-router-dom'
import { expect } from '@jest/globals'

test('OnboardingLayout should render', () => {
    render(
        <MemoryRouter>
            <UserProvider>
                <OnboardingLayout />
            </UserProvider>
        </MemoryRouter>,
    )
})
