import { toast } from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import PostForm, { PostValues } from '../components/PostForm'
import usePosts from '../hooks/usePosts'

export default function PostCreate() {
    const navigate = useNavigate()

    const { create } = usePosts()

    const onSubmit = async (values: PostValues) => {
        try {
            await create(values.content)
            toast('貼文成功送出')
            navigate('/')
        } catch (err) {
            toast((err as Error).message)
        }
    }

    return (
        <div className="p-4">
            <PostForm onCancel={() => navigate('/')} onSubmit={onSubmit} />
        </div>
    )
}
