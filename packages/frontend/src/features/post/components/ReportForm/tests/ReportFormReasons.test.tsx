import { fireEvent, render, screen } from '@testing-library/react'
import { FieldErrors } from 'react-hook-form'
import { REGISTER_ID, ReportFormReasons } from '../ReportFormReasons'

let mockRegister: jest.Mock
let mockError: FieldErrors
let mockGetValues: jest.Mock
let mockTrigger: jest.Mock

beforeEach(() => {
    jest.clearAllMocks()
    mockRegister = jest.fn()
    mockError = { [REGISTER_ID]: true } as unknown as FieldErrors
    mockGetValues = jest.fn().mockReturnValue(-1)
    mockTrigger = jest.fn()
})

describe('ReportFormReasons', () => {
    it('should not render OptionContainer', () => {
        render(
            <ReportFormReasons
                register={mockRegister}
                errors={mockError}
                setValue={() => {}}
                getValues={mockGetValues}
                trigger={mockTrigger}
            />,
        )
        expect(screen.queryByTestId('option-container')).not.toBeInTheDocument()
    })

    it('should render OptionContainer', () => {
        render(
            <ReportFormReasons
                register={mockRegister}
                errors={mockError}
                setValue={() => {}}
                getValues={mockGetValues}
                trigger={mockTrigger}
            />,
        )
        fireEvent.click(screen.getByTestId('option-controller')!)
        expect(screen.getByTestId('option-container')).toBeInTheDocument()
    })

    it('should render ReportFormStepErrorHint', () => {
        render(
            <ReportFormReasons
                register={mockRegister}
                errors={mockError}
                setValue={() => {}}
                getValues={mockGetValues}
                trigger={mockTrigger}
            />,
        )
        expect(screen.getByText('此為必選欄位')).toBeInTheDocument()
    })
})
