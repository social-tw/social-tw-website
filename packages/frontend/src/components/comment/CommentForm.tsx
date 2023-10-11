import React from 'react'
import Avatar from '../../assets/avatar.png'
import { Controller } from 'react-hook-form'
import RichTextEditor from '../RichTextEditor'

interface CommentFormProps {
    isOpen: boolean
}

const CommentForm: React.FC<CommentFormProps> = ({
    isOpen
}) => {
    if (!isOpen) return null

    return (
        <form className='fixed w-screen bg-gray-900/60 py-4 px-4 bottom-0 z-50 flex flex-col border-gray-400 border-t-2'>
            <div className='w-full flex pb-2'>
                <div className='w-[28px] h-[28px] rounded-full bg-gray-400 border-white border-4 flex items-center justify-center mr-auto'>
                    <img src={Avatar} alt='Avatar' />
                </div>
                <button className='text-center px-4 py-2 rounded-xl text-white text-xs font-bold tracking-wide'>
                    取消
                </button>
                <button className='bg-[#52ACBC] text-center px-4 py-2 rounded-xl text-white text-xs font-bold tracking-wide'>
                    發佈留言
                </button>
            </div>
            <div className='w-full'>
                <section>
                    <RichTextEditor
                        ariaLabel='comment editor'
                        placeholder='你想留什麼言呢......？'
                        classes={{
                            content:
                                'min-h-[3rem] overflow-auto text-white text-xl',
                            placeholder: 'text-gray-300 text-lg',
                        }}
                    />
                </section>
            </div>
        </form>
    )
}

export default CommentForm
