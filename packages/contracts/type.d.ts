import { Contract } from 'ethers'

declare global {
    namespace Chai {
        interface Assertion {
            reverted: Assertion
            revertedWith(reason: string): Promise<void>
            emit(contract: Contract, eventName: string): EmitMatcher
        }

        interface EmitMatcher {
            withArgs(...args: any[]): EmitMatcher
            from(address: string): Assertion
            atLeastOnce(): Assertion
            exactly(times: number): Assertion
        }
    }
}
