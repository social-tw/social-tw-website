import React from "react";
import Post from "./Post";

interface PostProps {
    text: string;
    time: string;
    timeLink: string;
    comment: string;
    commentLink: string;
}

interface PostListProps {
    posts: PostProps[];
}

const PostList: React.FC<PostListProps> = ({posts}) => {
    return (
        <div className="post-list space-y-[57px]">
            {posts.map((post, index) => (
                <Post key={index} {...post} />
            ))}
        </div>
    );
};

export default PostList;
