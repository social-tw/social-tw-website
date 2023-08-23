import Text from './Text'
import React from 'react'

interface LinkProps {
    text: string
    path: string
}

const Link: React.FC<LinkProps> = ({ text, path }) => {
    return (
        <a href={path} className="text-link pb-7">
            <Text text={text} size={'text-2xl'} other={'font-medium'} />
        </a>
    )
}

export default Link
