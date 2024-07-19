import { MutationKeys, QueryKeys } from '@/constants/queryKeys'
import {
    ActionType,
    addAction,
    failActionById,
    ReportCommentData,
    succeedActionById,
    useActionCount,
    useUserState,
} from '@/features/core'
import { ReportCategory, ReportType } from '@/types/Report'
import { relayReport } from '@/utils/api'
import { getEpochKeyNonce } from '@/utils/helpers/getEpochKeyNonce'
import { useMutation, useQueryClient } from '@tanstack/react-query'

export function useReportComment() {
    const queryClient = useQueryClient()
    const actionCount = useActionCount()
    const { getGuaranteedUserState } = useUserState()

    const {
        mutateAsync: reportComment,
        isIdle,
        isPending,
        isSuccess,
        isError,
        reset,
    } = useMutation({
        mutationKey: [MutationKeys.ReportComment],
        mutationFn: async ({
            postId,
            commentId,
            category,
            reason,
        }: {
            postId: string
            commentId: string
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
                type: ReportType.COMMENT,
                objectId: commentId,
                reportorEpochKey: epochKey,
                reason,
                category,
                reportEpoch: epoch,
            })
            return {
                postId,
                commentId,
                epoch,
                epochKey,
            }
        },
        onMutate: (variables) => {
            const reportCommentData: ReportCommentData = {
                commentId: variables.commentId,
                epoch: undefined,
                epochKey: undefined,
            }
            const actionId = addAction(
                ActionType.ReportComment,
                reportCommentData,
            )
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
                    commentId: data.commentId,
                    epoch: data.epoch,
                    epochKey: data.epochKey,
                })
            }
            queryClient.invalidateQueries({
                queryKey: [QueryKeys.ManyComments, data.postId],
            })
        },
    })

    return { reportComment, isIdle, isPending, isSuccess, isError, reset }
}
