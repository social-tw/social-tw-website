import { Synchronizer } from '@unirep/core'

export class EpochDateService {
    static isValidDateRange(start: Date, end: Date) {
        return start.getTime() <= end.getTime()
    }

    static createFromToEpochByDateRange(
        start: Date | undefined,
        end: Date | undefined,
        synchoronizer: Synchronizer,
        epochLength: number,
    ) {
        if (!!start && !!end && EpochDateService.isValidDateRange(start, end)) {
            const [from, to] = EpochDateService.calcEpochsByDates(
                [start, end],
                synchoronizer,
                epochLength,
            )
            return new ValidFromToEpoch(from, to)
        }
        return new InvalidFromToEpoch()
    }

    static calcEpochsByDates(
        dates: Date[],
        synchoronizer: Synchronizer,
        epochLength: number,
    ) {
        const now = Date.now()
        return dates.map((date) =>
            EpochDateService.calcEpochByDate(
                now,
                date,
                synchoronizer,
                epochLength,
            ),
        )
    }

    static calcEpochByDate(
        now: number,
        date: Date,
        synchoronizer: Synchronizer,
        epochLength: number,
    ) {
        const currentEpoch = synchoronizer.calcCurrentEpoch()
        const remainingTime = synchoronizer.calcEpochRemainingTime() * 1000
        const currentEpochStartTime = now - (epochLength - remainingTime)
        const serviceStartTime =
            currentEpochStartTime - epochLength * currentEpoch

        return Math.max(
            0,
            Math.floor((date.getTime() - serviceStartTime) / epochLength),
        )
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
    constructor(
        public from: number,
        public to: number,
    ) {}
}
