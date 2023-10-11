export const SERVER = getServer(process.env.ENV!)

function getServer(env: string): string {
    let server = 'http://localhost:8000'
    switch (env) {
        case 'STAGE':
            server = process.env.STAGE_SERVER!
            break
        case 'PROD':
            server = process.env.PROD_SERVER!
            break
        default:
            break
    }
    return server
}

export const KEY_SERVER = `${getServer(process.env.ENV!)}/build/`
