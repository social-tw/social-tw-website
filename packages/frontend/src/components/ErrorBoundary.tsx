import { isRouteErrorResponse, useRouteError } from 'react-router-dom'


export default function ErrorBoundary() {
    const error = useRouteError() as Error

    const message = isRouteErrorResponse(error) ? error.statusText : error.message

    return (
        <div className="flex flex-col items-center justify-center w-screen h-screen">
            <div className="prose text-center">
                <h1>Oops!</h1>
                <p>Sorry, an unexpected error has occurred.</p>
                <p>
                    <i>{message}</i>
                </p>
            </div>
        </div>
    )
}
