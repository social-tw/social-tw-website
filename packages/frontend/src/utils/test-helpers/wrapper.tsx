import { type ReactNode } from 'react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

interface TestWrapperProps {
    children: ReactNode
    initialEntries?: string[]
}

export function wrapper({ children }: { children: ReactNode }) {
    const queryClient = new QueryClient()
    return (
        <QueryClientProvider client={queryClient}>
            <MemoryRouter>{children}</MemoryRouter>
        </QueryClientProvider>
    )
}

export const TestWrapper: React.FC<TestWrapperProps> = ({
    children,
    initialEntries = ['/'],
}) => (
    <MemoryRouter initialEntries={initialEntries}>
        <Routes>
            <Route path="*" element={children} />
        </Routes>
    </MemoryRouter>
)
