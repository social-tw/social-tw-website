import React from "react";
import Text from "./shared/Text";
import Link from "./shared/Link";

interface TextProps {
    text: string;
    time: string;
    timeLink: string;
    comment: string;
    commentLink: string;
}

const Post: React.FC<TextProps> = ({text, time, timeLink, comment, commentLink}) => {
    return (
        <div className={'flex flex-row items-center justify-center'}>
            <div className={'avatar w-24 h-24 rounded-full'}>
                <img className={'object-cover'} src="/social_tw_logo.svg" alt="avatar" />
            </div>
            <div className={'bg-white rounded-[20px]'}>
                <div className={'flex flex-row items-center justify-between  w-[1200px] '}>
                    <Text text={text} size={'text-[24px]'} other={'font-medium w-[1124px] pt-[30px] pl-[38px] text-black'} />
                </div>
                <div className={'flex justify-between pt-[30px] pl-[38px] pr-[34px]'}>
                    <Link text={time} path={timeLink} />
                    <Link text={comment} path={commentLink} />
                </div>
            </div>
        </div>
    );
};

export default Post;
