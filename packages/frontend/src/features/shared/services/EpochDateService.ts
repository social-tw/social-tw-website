export class EpochDateService {
    static isValidDateRange(start: Date, end: Date) {
        return start.getTime() <= end.getTime()
    }

    static createFromToEpochByDateRange(
        start: Date | undefined,
        end: Date | undefined,
    ) {
        return !!start && !!end && EpochDateService.isValidDateRange(start, end)
            ? new ValidFromToEpoch(start, end)
            : new InvalidFromToEpoch()
    }
}

export interface FromToEpoch {
    from: number
    to: number
}

export class InvalidFromToEpoch implements FromToEpoch {
    from: number
    to: number
    constructor() {
        this.from = -1
        this.to = -1
    }
}

export class ValidFromToEpoch implements FromToEpoch {
    from: number
    to: number
    constructor(startDate: Date, endDate: Date) {
        if (!EpochDateService.isValidDateRange(startDate, endDate)) {
            throw Error('Invalid date range')
        }
        this.from = this.getEpochByDate(startDate)
        this.to = this.getEpochByDate(endDate)
    }
    private getEpochByDate(date: Date) {
        return 2
    }
}
