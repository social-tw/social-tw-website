import {
    ActionStatus,
    ActionType,
    addAction,
    failActionById,
    removeActionByCommentId,
    removeActionById,
    succeedActionById,
    useActionStore,
} from '@/contexts/Actions'
import { act, renderHook } from '@testing-library/react'

describe('useActionStore', () => {
    it('check data structure of the action store', () => {
        const { result } = renderHook(() => useActionStore())

        expect(result.current).toHaveProperty('entities', {})
        expect(result.current).toHaveProperty('list', [])
        expect(result.current).toHaveProperty('latestId', undefined)
    })

    it('add a post action', () => {
        const postData = {
            id: 'post-id-1',
            content: 'This is a post',
        }

        const { result } = renderHook(() => useActionStore())

        let actionId = ''
        act(() => {
            actionId = addAction(ActionType.Post, postData)
        })

        expect(actionId).toBeTruthy()
        expect(result.current.entities).toHaveProperty(actionId)
        expect(result.current.entities[actionId]).toHaveProperty('id')
        expect(result.current.entities[actionId]).toHaveProperty(
            'type',
            ActionType.Post,
        )
        expect(result.current.entities[actionId]).toHaveProperty(
            'status',
            ActionStatus.Pending,
        )
        expect(result.current.entities[actionId]).toHaveProperty('submittedAt')
        expect(result.current.entities[actionId]).toHaveProperty(
            'data',
            postData,
        )
        expect(result.current.list).toContain(actionId)
        expect(result.current.latestId).toBe(actionId)
    })

    it('add a comment action', () => {
        const commentData = {
            commentId: 'comment-id-1',
            postId: 'post-id',
            content: 'This is a comment',
            epochKey: 'epochKey',
            epoch: 10,
            transactionHash: '0x-transaction-hash',
        }

        const { result } = renderHook(() => useActionStore())

        let actionId = ''
        act(() => {
            actionId = addAction(ActionType.Comment, commentData)
        })

        expect(actionId).toBeTruthy()
        expect(result.current.entities).toHaveProperty(actionId)
        expect(result.current.entities[actionId]).toHaveProperty('id')
        expect(result.current.entities[actionId]).toHaveProperty(
            'type',
            ActionType.Comment,
        )
        expect(result.current.entities[actionId]).toHaveProperty(
            'status',
            ActionStatus.Pending,
        )
        expect(result.current.entities[actionId]).toHaveProperty('submittedAt')
        expect(result.current.entities[actionId]).toHaveProperty(
            'data',
            commentData,
        )
        expect(result.current.list).toContain(actionId)
        expect(result.current.latestId).toBe(actionId)
    })

    it('succeed an action by id', () => {
        const postData = {
            id: 'post-id-2',
            content: 'This is a post',
        }

        const { result } = renderHook(() => useActionStore())

        let actionId = ''
        act(() => {
            actionId = addAction(ActionType.Post, postData)
            succeedActionById(actionId)
        })

        expect(result.current.entities[actionId]).toHaveProperty(
            'status',
            ActionStatus.Success,
        )
    })

    it('fail an action by id', () => {
        const postData = {
            id: 'post-id-3',
            content: 'This is a post',
        }

        const { result } = renderHook(() => useActionStore())

        let actionId = ''
        act(() => {
            actionId = addAction(ActionType.Post, postData)
            failActionById(actionId)
        })

        expect(result.current.entities[actionId]).toHaveProperty(
            'status',
            ActionStatus.Failure,
        )
    })

    it('remove an action by id', () => {
        const postData = {
            id: 'post-id-4',
            content: 'This is a post',
        }

        const { result } = renderHook(() => useActionStore())

        let actionId = ''
        act(() => {
            actionId = addAction(ActionType.Post, postData)
            removeActionById(actionId)
        })

        expect(result.current.entities).not.toHaveProperty(actionId)
        expect(result.current.list).not.toContain(actionId)
    })

    it('remove an comment action by comment id', () => {
        const commentData = {
            commentId: 'comment-id-2',
            postId: 'post-id',
            content: 'This is a comment',
            epochKey: 'epochKey',
            epoch: 10,
            transactionHash: '0x-transaction-hash',
        }

        const { result } = renderHook(() => useActionStore())

        let actionId = ''
        act(() => {
            actionId = addAction(ActionType.Comment, commentData)
            removeActionByCommentId(commentData.commentId)
        })

        expect(result.current.entities).not.toHaveProperty(actionId)
        expect(result.current.list).not.toContain(actionId)
    })
})
