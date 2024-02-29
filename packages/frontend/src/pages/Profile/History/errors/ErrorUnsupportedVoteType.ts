export class ErrorUnsupportedVoteType extends Error {
    constructor() {
        super()
        this.name = 'ErrorUnsupportedVoteType'
        this.message = 'Unsupported Vote Type Detected'
    }
}
