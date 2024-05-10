import { getEpochKeyNonce } from '@/utils/getEpochKeyNonce'

describe('getEpochKeyNonce', () => {
    it('returns actionCount when it is less than NUM_EPOCH_KEY_NONCE_PER_EPOCH', () => {
        expect(getEpochKeyNonce(0)).toBe(0)
        expect(getEpochKeyNonce(1)).toBe(1)
        expect(getEpochKeyNonce(2)).toBe(2)
    })

    it('returns a random number when actionCount is greater than or equal to NUM_EPOCH_KEY_NONCE_PER_EPOCH', () => {
        jest.spyOn(Math, 'random').mockReturnValue(0.6)
        expect(getEpochKeyNonce(3)).toBe(1)
    })
})
