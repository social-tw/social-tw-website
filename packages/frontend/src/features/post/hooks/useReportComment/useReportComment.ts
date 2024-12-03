import { MutationKeys, QueryKeys } from '@/constants/queryKeys'
import {
    ActionType,
    addAction,
    failActionById,
    ReportCommentData,
    ReportService,
    succeedActionById,
    useActionCount,
    useUserState,
    useUserStateTransition,
} from '@/features/core'
import { ReportType } from '@/types/Report'
import { getEpochKeyNonce } from '@/utils/helpers/getEpochKeyNonce'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import NotificationService from '@/features/notification/services/NotificationService'

export function useReportComment() {
    const queryClient = useQueryClient()
    const actionCount = useActionCount()
    const { getGuaranteedUserState } = useUserState()
    const { stateTransition } = useUserStateTransition()

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
            category: number
            reason: string
        }) => {
            const userState = await getGuaranteedUserState()
            const reportService = new ReportService(userState)
            const identityNonce = getEpochKeyNonce(Math.max(0, actionCount - 1))
            await stateTransition()
            const { epoch, epochKey } = await reportService.createReport({
                type: ReportType.COMMENT,
                objectId: commentId,
                reason,
                category,
                identityNonce,
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
            NotificationService.sendNotification(
                'REPORT_FAILED',
                `/posts/${_variables.postId}#${_variables.commentId}`,
            )
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
            NotificationService.sendNotification('REPORT_SUCCEEDED')
        },
    })

    return { reportComment, isIdle, isPending, isSuccess, isError, reset }
}
