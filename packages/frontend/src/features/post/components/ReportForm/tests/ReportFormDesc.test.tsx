import { render, screen } from '@testing-library/react'
import { FieldErrors } from 'react-hook-form'
import { REGISTER_ID, ReportFormDesc } from '../ReportFormDesc'

describe('ReportFormDesc', () => {
    it('should render ReportFormStepErrorHint if has error', () => {
        const mockRegister = jest.fn().mockReturnValue({})
        const mockError = { [REGISTER_ID]: true } as unknown as FieldErrors
        render(<ReportFormDesc register={mockRegister} errors={mockError} />)
        expect(screen.getByText('檢舉描述長度至少為10個字')).toBeInTheDocument()
    })
})
