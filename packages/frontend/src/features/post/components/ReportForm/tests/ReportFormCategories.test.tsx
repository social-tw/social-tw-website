import { wrapper } from '@/utils/test-helpers/wrapper'
import { fireEvent, render, screen } from '@testing-library/react'
import { FieldErrors } from 'react-hook-form'
import { REGISTER_ID, ReportFormCategories } from '../ReportFormCategories'

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

describe('ReportFormCategories', () => {
    it('should not render OptionContainer', () => {
        render(
            <ReportFormCategories
                register={mockRegister}
                errors={mockError}
                setValue={() => {}}
                getValues={mockGetValues}
                trigger={mockTrigger}
            />,
            { wrapper },
        )
        expect(screen.queryByTestId('option-container')).not.toBeInTheDocument()
    })

    it('should render OptionContainer', () => {
        render(
            <ReportFormCategories
                register={mockRegister}
                errors={mockError}
                setValue={() => {}}
                getValues={mockGetValues}
                trigger={mockTrigger}
            />,
            { wrapper },
        )
        fireEvent.click(screen.getByTestId('option-controller')!)
        expect(screen.getByTestId('option-container')).toBeInTheDocument()
    })

    it('should render ReportFormStepErrorHint', () => {
        render(
            <ReportFormCategories
                register={mockRegister}
                errors={mockError}
                setValue={() => {}}
                getValues={mockGetValues}
                trigger={mockTrigger}
            />,
            { wrapper },
        )
        expect(screen.getByText('此為必選欄位')).toBeInTheDocument()
    })
})
