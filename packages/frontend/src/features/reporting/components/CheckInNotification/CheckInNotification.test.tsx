import { wrapper } from '@/utils/test-helpers/wrapper'
import { render, screen } from '@testing-library/react'
import CheckInNotification from './CheckInNotification'

describe('CheckInNotification', () => {
    it('should render CheckInSnackbar and CheckIn components', () => {
        render(<CheckInNotification />, { wrapper })

        expect(screen.getByTestId('check-in-notification')).toBeInTheDocument()
    })
})
