import { useBackgroundReputationClaim } from '@/features/reporting/hooks/useBackgroundReputationClaim/useBackgroundReputationClaim'
import { useMediaQuery } from '@uidotdev/usehooks'
import DesktopAppLayout from './layout.desktop'
import MobileAppLayout from './layout.mobile'

export default function AppLayout() {
    useBackgroundReputationClaim()

    const isMobile = useMediaQuery('only screen and (max-width : 1023px)')

    return isMobile ? <MobileAppLayout /> : <DesktopAppLayout />
}
