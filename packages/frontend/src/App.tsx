import { QueryProvider } from '@/features/core'
import Router from '@/routes/router'

function App() {
    return (
        <QueryProvider>
            <Router />
        </QueryProvider>
    )
}

export default App
