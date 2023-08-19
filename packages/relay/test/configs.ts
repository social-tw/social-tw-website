import getPort from 'get-port'

let PORT: number
let HTTP_SERVER: string

const epochLength = 300

;(async () => {
    const dynamicPort: number = await getPort()
    process.env.PORT = dynamicPort.toString()
    process.env.HTTP_SERVER = `http://127.0.0.1:${process.env.PORT}`

    PORT = parseInt(process.env.PORT ?? '8000', 10)
    HTTP_SERVER = `http://127.0.0.1:${PORT}`
})()

export { PORT, HTTP_SERVER, epochLength }
