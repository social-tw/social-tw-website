import fs from 'fs'
import path from 'path'

import { config } from 'hardhat'

const verifiersPath = path.join(`${config.paths.sources}/verifiers`)

const zkFilesPath = path.join('../../circuits/zksnarkBuild')
const Circuit = {
    dataProof: 'dataProof',
    reportNonNullifierProof: 'reportNonNullifierProof',
    reportNullifierProof: 'reportNullifierProof',
    dailyClaimProof: 'dailyClaimProof',
}

const main = async (): Promise<number> => {
    // create verifier folder
    try {
        fs.mkdirSync(verifiersPath, { recursive: true })
    } catch (e) {
        console.log('Cannot create folder ', e)
    }

    for (const circuit of Object.keys(Circuit)) {
        const verifierName = createVerifierName(circuit)
        const solOut = path.join(verifiersPath, `${verifierName}.sol`)
        const vKey = require(path.join(zkFilesPath, `${circuit}.vkey.json`))

        console.log(`Exporting ${circuit} verification contract...`)
        const verifier = genVerifier(verifierName, vKey)

        fs.writeFileSync(solOut, verifier)
        fs.copyFileSync(solOut, path.join(verifiersPath, `${verifierName}.sol`))
    }
    return 0
}
export const createVerifierName = (circuit: string) => {
    return `${circuit.charAt(0).toUpperCase() + circuit.slice(1)}Verifier`
}

export const genVerifier = (contractName: string, vk: any): string => {
    const templatePath = path.resolve(
        __dirname,
        './template/groth16Verifier.txt'
    )

    let template = fs.readFileSync(templatePath, 'utf8')

    template = template.replace('<%contract_name%>', contractName)

    const vkalpha1 =
        `uint256(${vk.vk_alpha_1[0].toString()}),` +
        `uint256(${vk.vk_alpha_1[1].toString()})`
    template = template.replace('<%vk_alpha1%>', vkalpha1)

    const vkbeta2 =
        `[uint256(${vk.vk_beta_2[0][1].toString()}),` +
        `uint256(${vk.vk_beta_2[0][0].toString()})], ` +
        `[uint256(${vk.vk_beta_2[1][1].toString()}),` +
        `uint256(${vk.vk_beta_2[1][0].toString()})]`
    template = template.replace('<%vk_beta2%>', vkbeta2)

    const vkgamma2 =
        `[uint256(${vk.vk_gamma_2[0][1].toString()}),` +
        `uint256(${vk.vk_gamma_2[0][0].toString()})], ` +
        `[uint256(${vk.vk_gamma_2[1][1].toString()}),` +
        `uint256(${vk.vk_gamma_2[1][0].toString()})]`
    template = template.replace('<%vk_gamma2%>', vkgamma2)

    const vkdelta2 =
        `[uint256(${vk.vk_delta_2[0][1].toString()}),` +
        `uint256(${vk.vk_delta_2[0][0].toString()})], ` +
        `[uint256(${vk.vk_delta_2[1][1].toString()}),` +
        `uint256(${vk.vk_delta_2[1][0].toString()})]`
    template = template.replace('<%vk_delta2%>', vkdelta2)

    template = template.replaceAll(
        '<%vk_input_length%>',
        (vk.IC.length - 1).toString()
    )
    template = template.replace('<%vk_ic_length%>', vk.IC.length.toString())
    let vi = ''
    for (let i = 0; i < vk.IC.length; i++) {
        if (vi.length !== 0) {
            vi = vi + '        '
        }
        vi =
            vi +
            `vk.IC[${i}] = Pairing.G1Point(uint256(${vk.IC[
                i
            ][0].toString()}),` +
            `uint256(${vk.IC[i][1].toString()}));\n`
    }
    template = template.replace('<%vk_ic_pts%>', vi)

    return template
}

void (async () => {
    let exitCode
    try {
        exitCode = await main()
    } catch (err) {
        console.error(err)
        exitCode = 1
    }
    process.exit(exitCode)
})()
