import { render as rtlRender, RenderOptions } from '@testing-library/react'
import { ReactElement } from 'react'
import { MemoryRouter } from 'react-router-dom'

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
    route?: string
    useRouter?: boolean
}

function render(
    ui: ReactElement,
    {
        route = '/',
        useRouter = true,
        ...renderOptions
    }: CustomRenderOptions = {},
) {
    function Wrapper({ children }: { children: React.ReactNode }) {
        if (useRouter) {
            return (
                <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
            )
        }
        return <>{children}</>
    }

    return rtlRender(ui, { wrapper: Wrapper, ...renderOptions })
}

export * from '@testing-library/react'
export { render }
