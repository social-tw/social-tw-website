import ShareImg from '@/assets/img/share.png'
import { useAuthStatus } from '@/features/auth'
import { useCopy } from '@/features/shared/hooks/useCopy'
import { motion } from 'framer-motion'

export function Share({ postId }: { postId: string }) {
    const { isLoggedIn } = useAuthStatus()

    const { hasCopied, copyToClipboard } = useCopy()

    const onShare = () => {
        if (postId) {
            const postLink = `${window.location.origin}/posts/${postId}`
            copyToClipboard(postLink)
        }
    }

    return (
        <>
            <ShareButton disabled={!isLoggedIn} onClick={onShare} />
            <ShareAnimation on={hasCopied} />
        </>
    )
}

function ShareButton({
    disabled = false,
    onClick = () => {},
}: {
    disabled?: boolean
    onClick?: () => void
}) {
    return (
        <>
            <button
                className="flex items-center gap-1 cursor-pointer disabled:cursor-not-allowed"
                disabled={disabled}
                onClick={(event) => {
                    event.preventDefault()
                    onClick()
                }}
            >
                <img className="w-5 h-5" src={ShareImg} alt="share" />
            </button>
        </>
    )
}

function ShareAnimation({ on = false }: { on?: boolean }) {
    if (!on) return null

    return (
        <motion.div
            className="absolute top-0 left-0 z-10 flex flex-row items-center justify-center w-full h-full gap-2 text-white"
            animate={{
                y: [100, 0],
                opacity: [0, 1, 0],
            }}
            transition={{
                y: {
                    type: 'spring',
                    stiffness: 50,
                    damping: 10,
                    duration: 1,
                },
                opacity: {
                    duration: 2, // Complete fade-in-out cycle
                    ease: 'easeInOut',
                },
            }}
        >
            <dialog className="flex gap-2 p-2 bg-white rounded-lg shadow-sm border-gray">
                <img className="w-6 h-6" src={ShareImg} alt="share" />
                <span className="block">貼文連結已複製成功！</span>
            </dialog>
        </motion.div>
    )
}
