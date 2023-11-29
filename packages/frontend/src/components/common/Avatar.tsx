import BoringAvatar from 'boring-avatars'

export default function Avatar({
    name,
    size = 20,
}: {
    name: string
    size?: number
}) {
    return (
        <div className="border-2 border-white rounded-full">
            <BoringAvatar
                size={size}
                name={name}
                variant="beam"
                colors={['#92A1C6', '#146A7C', '#F0AB3D', '#C271B4', '#C20D90']}
            />
        </div>
    )
}
