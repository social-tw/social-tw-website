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

// export const SERVER = 'https://relay.demo.unirep.io'
export const KEY_SERVER = 'http://localhost:8000/build/'
// export const KEY_SERVER = 'https://keys.unirep.io/2-beta-1/'
