import { useRouteError } from 'react-router-dom'

type RouteError = Error & { statusText: string }

export default function ErrorPage() {
    const error = useRouteError() as RouteError
    console.error(error)

    return (
        <div className="flex flex-col items-center justify-center w-screen h-screen">
            <div className="prose text-center">
                <h1>Oops!</h1>
                <p>Sorry, an unexpected error has occurred.</p>
                <p>
                    <i>{error.statusText || error.message}</i>
                </p>
            </div>
        </div>
    )
}
