import { MutationKeys } from '@/constants/queryKeys'
import { useActionCount, useUserState } from '@/features/core'
import { ReportCategory, ReportType } from '@/types/Report'
import { relayReport } from '@/utils/api'
import { getEpochKeyNonce } from '@/utils/helpers/getEpochKeyNonce'
import { useMutation } from '@tanstack/react-query'

export function useReportPost() {
    const actionCount = useActionCount()
    const { getGuaranteedUserState } = useUserState()

    const { mutateAsync: reportPost } = useMutation({
        mutationKey: [MutationKeys.CreateComment],
        mutationFn: async ({
            postId,
            type,
            category,
            reason,
        }: {
            postId: string
            type: ReportType
            category: ReportCategory
            reason: string
        }) => {
            const userState = await getGuaranteedUserState()
            const nonce = getEpochKeyNonce(Math.max(0, actionCount - 1))
            const proof = await userState.genEpochKeyProof({
                nonce,
            })
            await relayReport({
                proof,
                type,
                objectId: postId,
                reportorEpochKey: proof.epochKey.toString(),
                reason,
                category,
                reportEpoch: Number(proof.epoch),
            })
        },
    })

    return { reportPost }
}
