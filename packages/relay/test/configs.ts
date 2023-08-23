const epochLength = 300;
const PORT = parseInt(process.env.PORT ?? '8000', 10);
const HTTP_SERVER = `http://127.0.0.1:${PORT}`;

export { PORT, HTTP_SERVER, epochLength };