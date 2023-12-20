import BaseLayout from '../../layouts/BaseLayout'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

test('BaseLayout should render', () => {
    render(<BaseLayout />)
})
