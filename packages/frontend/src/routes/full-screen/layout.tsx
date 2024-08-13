import { ForbidActionDialog } from '@/features/shared/components/Dialog/ForbidActionDialog'
import {
    closeForbidActionDialog,
    useDialogStore,
} from '@/features/shared/stores/dialog'
import { Outlet } from 'react-router-dom'

export default function FullScreenLayout() {
    const isForbidActionDialogOpen = useDialogStore(
        (state) => state.forbidAction,
    )
    return (
        <div className="max-w-7xl min-h-screen mx-auto before:content-[' '] before:fixed before:top-0 before:left-0 before:-z-10 before:w-screen before:h-screen before:bg-[linear-gradient(200deg,#FF892A_-10%,#000000_15%,#2B2B2B_50%,#000000_85%,#52ACBC_110%)]">
            <Outlet />
            <ForbidActionDialog
                isOpen={isForbidActionDialogOpen}
                onClose={closeForbidActionDialog}
            />
        </div>
    )
}
