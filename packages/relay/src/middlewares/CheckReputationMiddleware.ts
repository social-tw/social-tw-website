import { ReputationProof } from "@unirep/circuits";
import Prover from "../services/utils/Prover";
import { InvalidReputationProofError, NonNegativeReputationUserError } from "../types";

export const checkReputation = async function (req, _, next) {
    // decode authorization
    const authorization = req.headers.authorization;
    const json = Buffer.from(authorization, "base64").toString()
    const { publicSignals, proof } = JSON.parse(json)

    // validate reputation proof
    const isValid = await Prover.verifyProof('reputation', publicSignals, proof)
    if (!isValid) {
        throw InvalidReputationProofError
    }

    const data = new ReputationProof(publicSignals, proof)

    // check negative reputation
    const maxRep = data.maxRep
    const proveMaxRep = data.proveMaxRep
    const one = BigInt(1)
    if (maxRep == one && proveMaxRep == one) {
        next();
    } else {
        throw NonNegativeReputationUserError
    }
}