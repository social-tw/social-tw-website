import { wrapper } from '@/utils/test-helpers/wrapper'
import { render } from '@testing-library/react'
import CheckInNotification from './CheckInNotification'

describe('CheckInNotification', () => {
    it('should render CheckInSnackbar and CheckIn components', () => {
        render(<CheckInNotification />, { wrapper })
    })
})
