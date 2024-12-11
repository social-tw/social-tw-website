import { UnirepSocialSynchronizer } from '../services/singletons/UnirepSocialSynchronizer'
import ProofHelper from '../services/utils/ProofHelper'
import { Errors } from '../types'

export const jsonToBase64 = (object) => {
    const json = JSON.stringify(object)
    return Buffer.from(json).toString('base64')
}

export const base64ToJson = (base64String) => {
    const json = Buffer.from(base64String, 'base64').toString()
    return JSON.parse(json)
}

export const createCheckReputationMiddleware = (
    synchronizer: UnirepSocialSynchronizer,
) =>
    async function (req, res, next) {
        const authentication = req.headers.authentication
        if (!authentication) throw Errors.INVALID_AUTHENTICATION()

        // decode authorization
        const { publicSignals, proof } = JSON.parse(atob(authentication))

        // verify reputation proof
        const reputationProof = await ProofHelper.getAndVerifyReputationProof(
            publicSignals,
            proof,
            synchronizer,
        )

        // check negative reputation
        const maxRep = reputationProof.maxRep
        const proveMaxRep = reputationProof.proveMaxRep
        res.locals.isNegativeReputation = maxRep > 0 && proveMaxRep > 0

        next()
    }
