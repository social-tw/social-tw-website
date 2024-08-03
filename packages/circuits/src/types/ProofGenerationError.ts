export class ProofGenerationError extends Error {
    constructor(message?: string) {
        super(message)
    }
}

export const InvalidProofInputError = new ProofGenerationError(
    'Proof Generation Error: the proof cannot be generated since the inputs are invalid'
)
