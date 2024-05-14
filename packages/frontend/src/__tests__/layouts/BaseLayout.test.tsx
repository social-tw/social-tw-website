import '@testing-library/jest-dom'
import { render } from '@testing-library/react'
import BaseLayout from '@/layouts/BaseLayout'

test('BaseLayout should render', () => {
    render(<BaseLayout />)
})
