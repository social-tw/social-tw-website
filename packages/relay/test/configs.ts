const epochLength = 300
const PORT = parseInt(process.env.PORT ?? '8000', 10)
const HTTP_SERVER = `http://127.0.0.1:${PORT}`
const CLIENT_URL = process.env.CLIENT_URL ?? 'http://localhost:3000'

export { PORT, HTTP_SERVER, epochLength, CLIENT_URL }
