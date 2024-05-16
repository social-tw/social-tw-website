import { DataProof } from '@unirep-app/circuits'
import { stringifyBigInts } from '@unirep/utils'
import { useUserState } from '@/hooks/useUserState/useUserState'
import prover from '@/utils/prover'

export function useProveData() {
    const { getGuaranteedUserState } = useUserState()

    const proveData = async (data: { [key: number]: string | number }) => {
        const userState = getGuaranteedUserState()
        const epoch = await userState.sync.loadCurrentEpoch()
        const chainId = userState.chainId
        const stateTree = await userState.sync.genStateTree(epoch)
        const index = await userState.latestStateTreeLeafIndex(epoch)
        const stateTreeProof = stateTree.createProof(index)
        const provableData = await userState.getProvableData()
        const sumFieldCount = userState.sync.settings.sumFieldCount
        const values = Array(sumFieldCount).fill(0)
        for (const [key, value] of Object.entries(data)) {
            values[Number(key)] = value
        }
        const attesterId = userState.sync.attesterId
        const circuitInputs = stringifyBigInts({
            identity_secret: userState.id.secret,
            state_tree_indices: stateTreeProof.pathIndices,
            state_tree_elements: stateTreeProof.siblings,
            data: provableData,
            epoch: epoch,
            chain_id: chainId,
            attester_id: attesterId,
            value: values,
        })
        const { publicSignals, proof } = await prover.genProofAndPublicSignals(
            'dataProof',
            circuitInputs,
        )
        const dataProof = new DataProof(publicSignals, proof, prover)
        const valid = await dataProof.verify()
        return stringifyBigInts({
            publicSignals: dataProof.publicSignals,
            proof: dataProof.proof,
            valid,
        })
    }

    return {
        proveData,
    }
}
