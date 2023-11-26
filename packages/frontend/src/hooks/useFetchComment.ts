import { action } from 'mobx';
import { useEffect, useMemo, useState } from 'react';
import {
    commentActionsSelector, CommentData, failedCommentActionsSelector,
    pendingCommentActionsSelector, useActionStore
} from '@/contexts/Actions';
import { useUser } from '@/contexts/User';
import { CommentInfo, CommentStatus, CommnetDataFromApi } from '@/types';
import randomNonce from '@/utils/randomNonce';
import { stringifyBigInts } from '@unirep/utils';

const demoComments = [
    {
        id: '1',
        epochKey: 'epochKey-2',
        publishedAt: Date.now(),
        content: '台灣der小巷就是讚啦！',
    },
    {
        id: '2',
        epochKey: 'epochKey-3',
        publishedAt: Date.now(),
        content: '這裡的芋圓推推推！',
    },
    {
        id: '3',
        epochKey: 'epochKey-4',
        publishedAt: Date.now(),
        content: '請問這是哪裡啊？',
    },
]

async function fetchCommentsByPostId(postId: string, epks: string): Promise<CommnetDataFromApi[]> {
    const queryParams = new URLSearchParams();
    if (postId) {
        queryParams.append('postId', postId);
    }
    if (epks) {
        queryParams.append('epks', epks);
    }

    const response = await fetch(`http://localhost:8000/api/comment?${queryParams.toString()}`);

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json(); 
}


export default function useFetchComment(postId?: string) {
    const { userState, stateTransition } = useUser();
    const [comments, setComments] = useState<CommentInfo[]>([]);

    const commentActions = useActionStore(commentActionsSelector);
    const failedActions = useActionStore(failedCommentActionsSelector);
    const pendingActions = useActionStore(pendingCommentActionsSelector);

    const allComments = useMemo(() => {
        const localComments: CommentInfo[] = commentActions.map((action) => ({
            ...action.data as CommentData,
            publishedAt: action.submittedAt,
            status: action.status as unknown as CommentStatus,
            // TODO: check this comment is mine
            isMine: true,
        }));
        return [
            ...comments,
            ...localComments,
        ];
    }, [comments, failedActions, pendingActions]);

    useEffect(() => {
        async function loadCommnets() {
            if (!postId || !userState) return;
            
            const latestTransitionedEpoch = await userState.latestTransitionedEpoch();
            console.log(latestTransitionedEpoch);
            console.log(userState.sync.calcCurrentEpoch());

            if (
                userState.sync.calcCurrentEpoch() !==
                latestTransitionedEpoch
            ) {
                await stateTransition()
            };

            const nonce = randomNonce();
            const epk = userState.getEpochKeys(latestTransitionedEpoch, nonce);
            const epks = stringifyBigInts(epk);

            const comments = await fetchCommentsByPostId(postId, epks);
            console.log(comments);
            const successfulComments = comments.map((comment) => ({
                ...comment,
                postId,
                status: CommentStatus.Success,
                // TODO: check this comment is mine
                isMine: false,
            }));

            setComments(successfulComments);
        }
        console.log('loading comments success');

        loadCommnets();
    }, [userState]);

    return {
        data: allComments,
    };
}
