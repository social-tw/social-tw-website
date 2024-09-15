import { Synchronizer } from '@unirep/core'
import { EpochDateService } from './EpochDateService'

class MockSynchronizer {
    calcCurrentEpoch() {
        return 1440
    }
    calcEpochRemainingTime() {
        return 300
    }
}

describe('EpochDateService', () => {
    describe('calcEpochByDate', () => {
        it('should execute properly', () => {
            const synchronizer =
                new MockSynchronizer() as unknown as Synchronizer
            const epochLength = 300000 // 5 minutes in milliseconds

            // service start time: 1720656000000 = 1721088000000 - 0 - 300000 * 1440
            // service start time: 2024-07-11T00:00:00.000Z
            const mockNow = 1721088000000 // 2024-07-16T00:00:00Z

            // at service start & now
            const date0 = new Date('2024-07-11T00:00:00Z')
            expect(
                EpochDateService.calcEpochByDate(mockNow, date0, synchronizer, epochLength),
            ).toBe(0)

            // between service start & now
            const date1 = new Date('2024-07-11T00:15:00Z')
            expect(
                EpochDateService.calcEpochByDate(mockNow, date1, synchronizer, epochLength),
            ).toBe(3) // 724 * 300000 + 1720655850000

            // before service start
            const date2 = new Date('2024-07-10T23:59:00Z')
            expect(
                EpochDateService.calcEpochByDate(mockNow, date2, synchronizer, epochLength),
            ).toBe(0)

            // future
            const date3 = new Date('2024-07-17T00:00:00Z')
            expect(
                EpochDateService.calcEpochByDate(mockNow, date3, synchronizer, epochLength),
            ).toBe(1440 + 12 * 24)
        })
    })
})
