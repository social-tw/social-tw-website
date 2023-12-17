export function getVariantAutoScrollY() {
    return {
        start: { y: 700 },
        end: {
            y: 0,
            transition: {
                delay: 0,
                duration: 1,
                ease: 'easeInOut',
            },
        },
    }
}

export function getVariantOpacityZeroToOne() {
    return {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                delay: 0,
                duration: 0.5,
                ease: 'easeInOut',
            },
        },
    }
}
