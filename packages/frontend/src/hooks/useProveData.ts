import { DataProof } from '@unirep-app/circuits'
import { stringifyBigInts } from '@unirep/utils'
import useUserState, { getGuaranteedUserState } from '@/hooks/useUserState'
import prover from '@/utils/prover'

export default function useProveData() {
    const { userState } = useUserState()

    const proveData = async (data: { [key: number]: string | number }) => {
        const _userState = getGuaranteedUserState(userState)
        const epoch = await _userState.sync.loadCurrentEpoch()
        const chainId = _userState.chainId
        const stateTree = await _userState.sync.genStateTree(epoch)
        const index = await _userState.latestStateTreeLeafIndex(epoch)
        const stateTreeProof = stateTree.createProof(index)
        const provableData = await _userState.getProvableData()
        const sumFieldCount = _userState.sync.settings.sumFieldCount
        const values = Array(sumFieldCount).fill(0)
        for (const [key, value] of Object.entries(data)) {
            values[Number(key)] = value
        }
        const attesterId = _userState.sync.attesterId
        const circuitInputs = stringifyBigInts({
            identity_secret: _userState.id.secret,
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
