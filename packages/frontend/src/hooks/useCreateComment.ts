import { nanoid } from "nanoid";
import {
  ActionType, addAction, failActionById, succeedActionById
} from "@/contexts/Actions";
import { useUser } from "@/contexts/User";
import { CommnetDataFromApi } from "@/types";
import randomNonce from "@/utils/randomNonce";

async function publishComment (data: any) {
    return new Promise<CommnetDataFromApi>((resolve, reject) => {
        setTimeout(() => {
            resolve(data)
            // reject()
        }, 10000)
    })
}

export default function useCreateComment() {
    const { userState, stateTransition, provider, loadData } = useUser()

    const create = async (postId: string, content: string) => {
        if (!userState) throw new Error('user state not initialized');

        const latestTransitionedEpoch = await userState.latestTransitionedEpoch();

        const nonce = randomNonce()
        const epochKey = userState.getEpochKeys(latestTransitionedEpoch, nonce)
    
        const data = {
            id: 'cached-' + nanoid(),
            postId,
            content,
            epochKey: epochKey.toString(),
        };
        const actionId = addAction(ActionType.Comment, data);

        try {
            const comment = await publishComment(data);

            succeedActionById(actionId, { id: comment?.id });
        } catch (error) {
            failActionById(actionId);
        }
    };

    return {
        create,
    };
}