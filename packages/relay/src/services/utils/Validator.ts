class Validator {
    isValidNumber(content: any): boolean {
        return !(
            content === undefined ||
            content === null ||
            isNaN(Number(content))
        )
    }
}

export default new Validator()
