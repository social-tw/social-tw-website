import { useRef } from 'react'
import { toast } from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import Dialog from '../components/Dialog'
import PostForm, { PostValues } from '../components/PostForm'
import usePosts from '../hooks/usePosts'
import { useUser } from '../contexts/User'
import ErrorModal from '../components/modal/ErrorModal'

export default function PostCreate() {
    const errorDialog = useRef<HTMLDialogElement>(null)

    const { isLogin } = useUser()

    const navigate = useNavigate()

    const { create } = usePosts()

    const onSubmit = async (values: PostValues) => {
        try {
            await create(values.content)
            toast('貼文成功送出')
            navigate('/')
        } catch (err) {
            errorDialog?.current?.showModal()
        }
    }

    if (!isLogin) {
        return (
            <ErrorModal 
                isOpen={true}
            />
        )
    } else {
        return (
            <div className="p-4">
                <PostForm onCancel={() => navigate('/')} onSubmit={onSubmit} />
                <Dialog ref={errorDialog}>
                    <section className="p-6 md:px-12">
                        <p className="text-base font-medium text-black/90">
                            親愛的用戶：
                            <br />
                            <br />
                            很抱歉通知您，我們注意到您的貼文發布時似乎遇到了網路連線不穩定的情況，導致發文失敗。我們深感抱歉給您帶來的不便。請您再次嘗試發佈文章{' '}
                            <br />
                            <br />
                            感謝您的理解與合作。
                        </p>
                    </section>
                    <section className="flex justify-center p-6 md:p-12 md:pt-0">
                        <button className="max-w-[285px] w-full h-14 rounded-lg bg-primary/90 text-white/90 flex justify-center items-center text-xl font-bold tracking-[30%]">
                            重新發佈
                        </button>
                    </section>
                </Dialog>
            </div>
        )
    }

}
