import { render, screen } from '@testing-library/react'
import { ReportFormCtn } from '../ReportFormCtn'

describe('ReportFormCtn', () => {
    it('should render children', () => {
        const childrenText = 'children text'
        render(
            <ReportFormCtn onSubmit={() => {}}>{childrenText}</ReportFormCtn>,
        )
        expect(screen.getByText(childrenText)).toBeInTheDocument()
    })
})
