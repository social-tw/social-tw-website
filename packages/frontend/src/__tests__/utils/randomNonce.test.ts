import randomNonce from '@/utils/randomNonce'
import useActionCount from '@/hooks/useActionCount'

jest.mock('@/hooks/useActionCount', () => ({
    __esModule: true,
    default: jest.fn(),
}))

describe('randomNonce', () => {
    it('returns actionCount when it is less than NUM_EPOCH_KEY_NONCE_PER_EPOCH', () => {
        ;(useActionCount as jest.Mock).mockReturnValue(1)
        expect(randomNonce()).toBe(1)
    })

    it('returns a random number when actionCount is greater than or equal to NUM_EPOCH_KEY_NONCE_PER_EPOCH', () => {
        ;(useActionCount as jest.Mock).mockReturnValue(4)

        jest.spyOn(Math, 'random').mockReturnValue(0.6)
        expect(randomNonce()).toBe(1)

        jest.restoreAllMocks()
    })
})
