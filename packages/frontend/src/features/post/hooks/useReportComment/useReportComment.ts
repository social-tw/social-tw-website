import { MutationKeys } from '@/constants/queryKeys'
import { useActionCount, useUserState } from '@/features/core'
import { ReportCategory, ReportType } from '@/types/Report'
import { relayReport } from '@/utils/api'
import { getEpochKeyNonce } from '@/utils/helpers/getEpochKeyNonce'
import { useMutation } from '@tanstack/react-query'

export function useReportComment() {
    const actionCount = useActionCount()
    const { getGuaranteedUserState } = useUserState()

    const { mutateAsync: reportComment } = useMutation({
        mutationKey: [MutationKeys.ReportComment],
        mutationFn: async ({
            commentId,
            category,
            reason,
        }: {
            commentId: string
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
                type: ReportType.COMMENT,
                objectId: commentId,
                reportorEpochKey: proof.epochKey.toString(),
                reason,
                category,
                reportEpoch: Number(proof.epoch),
            })
        },
    })

    return { reportComment }
}
