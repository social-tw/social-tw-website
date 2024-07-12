import { render as rtlRender } from '@testing-library/react'
import {
    ReactElement,
    JSXElementConstructor,
    ReactNode,
    ReactPortal,
    Component,
} from 'react'
import { MemoryRouter } from 'react-router-dom'

function render(
    ui:
        | string
        | number
        | boolean
        | ReactElement<any, string | JSXElementConstructor<any>>
        | Iterable<ReactNode>
        | ReactPortal
        | null
        | undefined,
    { route = '/', ...renderOptions } = {},
) {
    class Wrapper extends Component<{ children: any }> {
        render() {
            let { children } = this.props
            return (
                <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
            )
        }
    }

    return rtlRender(ui, { wrapper: Wrapper, ...renderOptions })
}

export * from '@testing-library/react'
export { render }
