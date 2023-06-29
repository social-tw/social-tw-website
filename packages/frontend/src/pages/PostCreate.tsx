import { Link } from 'react-router-dom'
import RichTextEditor from '../components/RichTextEditor'

export default function PostCreate() {
    return (
        <main className="max-w-3xl py-6 mx-auto space-y-6">
            <div className="text-center">
                <h2 className="text-3xl">匿名的環境還需要你一起守護 🫶🏻</h2>
            </div>
            <RichTextEditor />
            <section className="flex gap-4 items-center justify-center">
                <Link to="/posts" className="btn btn-ghost">
                    取消
                </Link>
                <button className="btn btn-primary">發出貼文</button>
            </section>
        </main>
    )
}
