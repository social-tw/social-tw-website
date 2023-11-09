export class InternalError extends Error {
    httpStatusCode: number

    constructor(message?: string, httpStatusCode: number = 500) {
        super(message) // Pass the message to the Error constructor
        this.httpStatusCode = httpStatusCode
    }
}
