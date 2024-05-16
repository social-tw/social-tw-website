import { type ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

export function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient()
  return (
      <QueryClientProvider client={queryClient}>
          <MemoryRouter>{children}</MemoryRouter>
      </QueryClientProvider>
  )
}