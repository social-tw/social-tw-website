import { ReputationProof } from '@unirep/circuits'
import Prover from '../services/utils/Prover'
import {
    InvalidAuthenticationError,
    InvalidReputationProofError,
} from '../types'

export const jsonToBase64 = (object) => {
    const json = JSON.stringify(object)
    return Buffer.from(json).toString('base64')
}

export const base64ToJson = (base64String) => {
    const json = Buffer.from(base64String, 'base64').toString()
    return JSON.parse(json)
}

export const checkReputation = async function (req, res, next) {
    // decode authorization
    const authentication = req.headers.authentication
    if (!authentication) {
        throw InvalidAuthenticationError
    }

    const { publicSignals, proof } = base64ToJson(authentication)

    // validate reputation proof
    const isValid = await Prover.verifyProof('reputation', publicSignals, proof)
    if (!isValid) {
        throw InvalidReputationProofError
    }

    const data = new ReputationProof(publicSignals, proof)

    // check negative reputation
    const maxRep = data.maxRep
    const proveMaxRep = data.proveMaxRep
    res.locals.isNegativeReputation = maxRep > 0 && proveMaxRep > 0

    next()
}
