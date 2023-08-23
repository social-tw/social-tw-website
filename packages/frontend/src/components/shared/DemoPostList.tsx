import React from 'react'
import DemoPost from './DemoPost'

// TODO: opacity animation
const DemoPostList = () => {
    const data = [
        {
            text: '今天真是一個美好的日子！我終於完成了我夢寐以求的目標：跑完全馬拉松！這個挑戰對我來說真的非常艱巨，但我堅持下來了。我要特別感謝我的家人和朋友對我一直以來的支持和鼓勵。無論你們在生活中面對什麼',
            likes: 214,
            dislikes: 26,
            comments: 16,
        },
        {
            text: '今天真是一個美好的日子！我終於完成了我夢寐以求的目標：跑完全馬拉松！這個挑戰對我來說真的非常艱巨，但我堅持下來了。我要特別感謝我的家人和朋友對我一直以來的支持和鼓勵。無論你們在生活中面對什麼',
            likes: 214,
            dislikes: 26,
            comments: 16,
        },
        {
            text: '今天真是一個美好的日子！我終於完成了我夢寐以求的目標：跑完全馬拉松！這個挑戰對我來說真的非常艱巨，但我堅持下來了。我要特別感謝我的家人和朋友對我一直以來的支持和鼓勵。無論你們在生活中面對什麼',
            likes: 214,
            dislikes: 26,
            comments: 16,
        },
        {
            text: '今天真是一個美好的日子！我終於完成了我夢寐以求的目標：跑完全馬拉松！這個挑戰對我來說真的非常艱巨，但我堅持下來了。我要特別感謝我的家人和朋友對我一直以來的支持和鼓勵。無論你們在生活中面對什麼',
            likes: 214,
            dislikes: 26,
            comments: 16,
        },
    ]

    return (
        <div
            className="      
      flex
      flex-col 
      items-center
      gap-6
      
    "
        >
            {data.map((item, i) => (
                <DemoPost
                    key={i}
                    index={i}
                    text={item.text}
                    likes={item.likes}
                    dislikes={item.dislikes}
                    comments={item.comments}
                />
            ))}
        </div>
    )
}

export default DemoPostList
