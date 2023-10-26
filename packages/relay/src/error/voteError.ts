export class VoteError extends Error {
    public status: number;

    constructor(message: string, status = 400, name: string) {
        super(message);
        this.name = name;
        this.status = status;
    }
}

export const InvalidEpochError = new VoteError("Invalid Epoch", 400, "InvalidEpochError");
export const InvalidAttesterIdError = new VoteError("Wrong attesterId", 400, "InvalidAttesterIdError");
export const InvalidProofError = new VoteError("Invalid proof", 400, "InvalidProofError");
export const InvalidPostIdError = new VoteError("Invalid postId", 400, "InvalidPostIdError");
export const InvalidVoteActionError = new VoteError("Invalid vote action", 400, "InvalidVoteActionError");