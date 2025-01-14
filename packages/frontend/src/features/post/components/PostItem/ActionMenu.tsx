import { ReactComponent as BanIcon } from '@/assets/svg/ban.svg'
import { AUTH_ERROR_MESSAGE } from '@/constants/errorMessage'
import { useAuthStatus } from '@/features/auth'
import { useAuthCheck } from '@/features/auth/hooks/useAuthCheck/useAuthCheck'
import { useReputationScore } from '@/features/reporting'
import { useDialog } from '@/features/shared'
import { openForbidActionDialog } from '@/features/shared/stores/dialog'
import {
    ActionMenuBottomSlide,
    ActionMenuBottomSlideItem,
    ActionMenuContainer,
    ActionMenuDropdown,
    ActionMenuDropdownItem,
    useActionMenu,
} from '../ActionMenu'
import { PostReportDialog } from './PostReportDialog'

interface ActionMenuProps {
    postId: string
}

export function ActionMenu({ postId }: ActionMenuProps) {
    const {
        isOpen: isActionMenuOpen,
        onOpen: onActionMenuOpen,
        onClose: onActionMenuClose,
    } = useActionMenu()

    const { isLoggedIn } = useAuthStatus()

    const {
        isOpen: isReportDialogOpen,
        onOpen: onReportDialogOpen,
        onClose: onReportDialogClose,
    } = useDialog()

    const { isValidReputationScore } = useReputationScore()
    const checkAuth = useAuthCheck(AUTH_ERROR_MESSAGE.DEFAULT)

    const onReport = isValidReputationScore
        ? onReportDialogOpen
        : openForbidActionDialog

    const handleReportPost = async () => {
        try {
            await checkAuth()
            onReport()
        } catch (error) {
            console.error(error)
        }
    }

    return (
        <ActionMenuContainer
            onOpen={onActionMenuOpen}
            onClose={onActionMenuClose}
            disabled={!isLoggedIn}
        >
            <ActionMenuDropdown
                isOpen={isActionMenuOpen}
                onClose={onActionMenuClose}
            >
                <ActionMenuDropdownItem
                    icon={<BanIcon />}
                    name="檢舉貼文"
                    onClick={handleReportPost}
                    disabled={false}
                />
            </ActionMenuDropdown>
            <ActionMenuBottomSlide
                isOpen={isActionMenuOpen}
                onClose={onActionMenuClose}
            >
                <ActionMenuBottomSlideItem
                    icon={<BanIcon />}
                    name="檢舉貼文"
                    onClick={handleReportPost}
                    disabled={false}
                />
            </ActionMenuBottomSlide>
            <PostReportDialog
                postId={postId}
                isOpen={isReportDialogOpen}
                onClose={onReportDialogClose}
            />
        </ActionMenuContainer>
    )
}
