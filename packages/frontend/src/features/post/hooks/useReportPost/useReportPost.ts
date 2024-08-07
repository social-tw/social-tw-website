import { MutationKeys, QueryKeys } from '@/constants/queryKeys'
import {
    ActionType,
    addAction,
    failActionById,
    ReportPostData,
    ReportService,
    succeedActionById,
    useActionCount,
    useUserState,
    useUserStateTransition,
} from '@/features/core'
import { ReportCategory, ReportType } from '@/types/Report'
import { getEpochKeyNonce } from '@/utils/helpers/getEpochKeyNonce'
import { useMutation, useQueryClient } from '@tanstack/react-query'

export function useReportPost() {
    const queryClient = useQueryClient()
    const actionCount = useActionCount()
    const { getGuaranteedUserState } = useUserState()
    const { stateTransition } = useUserStateTransition()

    const {
        mutateAsync: reportPost,
        isIdle,
        isPending,
        isSuccess,
        isError,
        reset,
    } = useMutation({
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
            const reportService = new ReportService(userState)
            const identityNonce = getEpochKeyNonce(Math.max(0, actionCount - 1))
            await stateTransition()
            const { epoch, epochKey } = await reportService.createReport({
                type: ReportType.POST,
                objectId: postId,
                reason,
                category,
                identityNonce,
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

    return { reportPost, isIdle, isPending, isSuccess, isError, reset }
}
