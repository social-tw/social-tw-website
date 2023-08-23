interface TextProps {
    text: string
    size: string
    other: string
}

const Text: React.FC<TextProps> = ({ text, size, other }) => {
    return (
        <h1 className={`text-left font-inter leading-relaxed ${size} ${other}`}>
            {text}
        </h1>
    )
}

export default Text
