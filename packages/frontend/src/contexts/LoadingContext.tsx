import React, { createContext, useState } from 'react'

interface LoadingContextType {
    isLoading: boolean
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>
}

interface LoadingProps {
    children: React.ReactNode
}

const LoadingContext = createContext<LoadingContextType>({
    isLoading: false,
    setIsLoading: () => {},
})

const LoadingProvider = ({ children }: LoadingProps) => {
    const [isLoading, setIsLoading] = useState(false)

    return (
        <LoadingContext.Provider value={{ isLoading, setIsLoading }}>
            {children}
        </LoadingContext.Provider>
    )
}

export { LoadingProvider, LoadingContext }
