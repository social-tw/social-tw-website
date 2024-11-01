import { AdjudicateValue } from '@/constants/report'
import { nanoid } from 'nanoid'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

export enum ActionType {
    Post = 'post',
    Comment = 'comment',
    DeleteComment = 'deleteComment',
    ReportPost = 'reportPost',
    ReportComment = 'reportComment',
    CheckIn = 'checkIn',
    Adjudicate = 'adjudicate',
}

export enum ActionStatus {
    Pending = 'pending',
    Success = 'success',
    Failure = 'failure',
}

export interface PostData {
    postId?: string
    content: string
    epoch?: number
    epochKey?: string
    transactionHash?: string
}

export interface CommentData {
    commentId?: string
    postId: string
    content: string
    epochKey?: string
    epoch?: number
    transactionHash?: string
}

export interface DeleteCommentData {
    postId: string
    commentId: string
    epoch: number
}

export interface ReportPostData {
    postId: string
    epoch?: number
    epochKey?: string
}

export interface ReportCommentData {
    commentId: string
    epoch?: number
    epochKey?: string
}

export interface AdjudicateData {
    reportId: string
    adjudicateValue: AdjudicateValue
}

export interface BaseAction<Type, Data> {
    id: string
    type: Type
    status: ActionStatus
    submittedAt: Date
    data: Data
}

export type Action =
    | BaseAction<ActionType.Post, PostData>
    | BaseAction<ActionType.Comment, CommentData>
    | BaseAction<ActionType.DeleteComment, DeleteCommentData>
    | BaseAction<ActionType.ReportPost, ReportPostData>
    | BaseAction<ActionType.ReportComment, ReportCommentData>
    | BaseAction<ActionType.CheckIn, undefined>
    | BaseAction<ActionType.Adjudicate, AdjudicateData>

export interface ActionState {
    entities: Record<string, Action>
    list: string[]
    latestId?: string
}

const initialState: ActionState = {
    entities: {},
    list: [],
    latestId: undefined,
}

function partializeStorage(state: ActionState): ActionState {
    const failedIds = Object.values(state.entities)
        .filter((action) => action.status === ActionStatus.Failure)
        .map((action) => action.id)

    return {
        entities: Object.fromEntries(
            failedIds.map((id) => [id, state.entities[id]]),
        ),
        list: failedIds,
    }
}

export const useActionStore = create<ActionState>()(
    persist(
        immer(() => initialState),
        {
            name: 'action-storage',
            storage: createJSONStorage(() => localStorage),
            partialize: partializeStorage,
        },
    ),
)

export function actionsSelector(state: ActionState) {
    return state.list.map((id) => state.entities[id])
}

export function latestActionSelector(state: ActionState) {
    return state.latestId ? state.entities[state.latestId] : undefined
}

export function postActionsSelector(state: ActionState) {
    return Object.values(state.entities).filter(
        (action) => action.type === ActionType.Post,
    )
}

export function commentActionsSelector(state: ActionState) {
    return Object.values(state.entities).filter(
        (action) => action.type === ActionType.Comment,
    )
}

export function pendingCommentActionsSelector(state: ActionState) {
    return Object.values(state.entities).filter(
        (action) =>
            action.type === ActionType.Comment &&
            action.status === ActionStatus.Pending,
    )
}

export function failedCommentActionsSelector(state: ActionState) {
    return Object.values(state.entities).filter(
        (action) =>
            action.type === ActionType.Comment &&
            action.status === ActionStatus.Failure,
    )
}

export function pendingCountSelector(state: ActionState) {
    return Object.values(state.entities).filter(
        (action) => action.status === ActionStatus.Pending,
    ).length
}

export function countByTimeRangeSelector(startTime: number, endTime: number) {
    return function (state: ActionState) {
        return Object.values(state.entities)
            .filter((action) => action.status !== ActionStatus.Failure)
            .filter(
                (action) =>
                    action.submittedAt.valueOf() > startTime &&
                    action.submittedAt.valueOf() <= endTime,
            ).length
    }
}

export function createAction<NewAction extends Action>(
    type: NewAction['type'],
    data: NewAction['data'],
): NewAction {
    return {
        id: nanoid(),
        type,
        status: ActionStatus.Pending,
        submittedAt: new Date(),
        data,
    } as NewAction
}

export function addAction<NewAction extends Action>(
    type: NewAction['type'],
    data: NewAction['data'],
) {
    const action = createAction(type, data)
    useActionStore.setState((state) => {
        state.entities[action.id] = action
        state.list.push(action.id)
        state.latestId = action.id
    })

    return action.id
}

export function succeedActionById(id: string, data?: any) {
    useActionStore.setState((state) => {
        state.entities[id].status = ActionStatus.Success
        state.entities[id].data = state.entities[id].data
            ? { ...state.entities[id].data, ...data }
            : undefined
        state.latestId = id
    })
}

export function failActionById(id: string, data?: any) {
    useActionStore.setState((state) => {
        state.entities[id].status = ActionStatus.Failure
        state.entities[id].data = state.entities[id].data
            ? { ...state.entities[id].data, ...data }
            : undefined
        state.latestId = id
    })
}

export function removeAction(id: string) {
    useActionStore.setState((state) => {
        delete state.entities[id]
        const index = state.list.findIndex((itemId) => itemId === id)
        if (index !== -1) state.list.splice(index, 1)
        if (state.latestId === id) state.latestId = undefined
    })
}

export function removeActionById(id: string) {
    useActionStore.setState((state) => {
        delete state.entities[id]
        const index = state.list.findIndex((itemId) => itemId === id)
        if (index !== -1) state.list.splice(index, 1)
        if (state.latestId === id) state.latestId = undefined
    })
}

export function removeActionByCommentId(commentId: string) {
    const state = useActionStore.getState()
    const actions = commentActionsSelector(state)
    const action = actions.find((action) => {
        if (action.type === ActionType.Comment) {
            return action.data.commentId === commentId
        }
        return false
    })

    if (!action) return
    removeActionById(action.id)
}

export function getActionMessage(type: ActionType) {
    const messages = {
        [ActionType.Post]: '貼文存取',
        [ActionType.Comment]: '留言存取',
        [ActionType.DeleteComment]: '刪除留言',
        [ActionType.ReportPost]: '檢舉貼文',
        [ActionType.ReportComment]: '檢舉留言',
        [ActionType.CheckIn]: '每日簽到',
        [ActionType.Adjudicate]: '檢舉仲裁',
    }
    return messages[type]
}

export function getActionSubject(type: ActionType) {
    const subjects = {
        [ActionType.Post]: '貼文',
        [ActionType.Comment]: '留言',
        [ActionType.DeleteComment]: '留言',
        [ActionType.ReportPost]: '檢舉',
        [ActionType.ReportComment]: '檢舉',
        [ActionType.CheckIn]: '簽到',
        [ActionType.Adjudicate]: '仲裁',
    }
    return subjects[type]
}
