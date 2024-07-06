import { MutationKeys, QueryKeys } from '@/constants/queryKeys'
import {
    ActionType,
    addAction,
    failActionById,
    ReportPostData,
    succeedActionById,
    useActionCount,
    useUserState,
} from '@/features/core'
import { ReportCategory, ReportType } from '@/types/Report'
import { relayReport } from '@/utils/api'
import { getEpochKeyNonce } from '@/utils/helpers/getEpochKeyNonce'
import { useMutation, useQueryClient } from '@tanstack/react-query'

export function useReportPost() {
    const queryClient = useQueryClient()
    const actionCount = useActionCount()
    const { getGuaranteedUserState } = useUserState()

    const { mutateAsync: reportPost } = useMutation({
        mutationKey: [MutationKeys.ReportPost],
        mutationFn: async ({
            postId,
            category,
            reason,
        }: {
            postId: string
            category: ReportCategory
            reason: string
        }) => {
            const userState = await getGuaranteedUserState()
            const nonce = getEpochKeyNonce(Math.max(0, actionCount - 1))
            const proof = await userState.genEpochKeyProof({
                nonce,
            })
            const epoch = Number(proof.epoch)
            const epochKey = proof.epochKey.toString()
            await relayReport({
                proof,
                type: ReportType.POST,
                objectId: postId,
                reportorEpochKey: epochKey,
                reason,
                category,
                reportEpoch: epoch,
            })
            return {
                postId,
                epoch,
                epochKey,
            }
        },
        onMutate: (variables) => {
            const reportPostData: ReportPostData = {
                postId: variables.postId,
                epoch: undefined,
                epochKey: undefined,
            }
            const actionId = addAction(ActionType.ReportPost, reportPostData)
            return { actionId }
        },
        onError: (_error, _variables, context) => {
            if (context?.actionId) {
                failActionById(context.actionId)
            }
        },
        onSuccess: (data, _variables, context) => {
            if (context?.actionId) {
                succeedActionById(context.actionId, {
                    postId: data.postId,
                    epoch: data.epoch,
                    epochKey: data.epochKey,
                })
            }
            queryClient.invalidateQueries({
                queryKey: [QueryKeys.SinglePost, data.postId],
            })
        },
    })

    return { reportPost }
}
