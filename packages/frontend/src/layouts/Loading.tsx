import React from 'react'

const Loading: React.FC = () => {
    return (
        <div className="flex h-full flex-col justify-center sm:px-6 lg-px-8">
            <h2 className="mt-6 text-center text-3xl font-bold tracking-wider">
                我們正在努力為你加載，請稍等...
            </h2>
        </div>
    )
}

export default Loading
