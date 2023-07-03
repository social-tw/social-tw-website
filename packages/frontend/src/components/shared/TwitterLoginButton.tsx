import React from 'react';
import TwitterLogin, { TwitterLoginButtonTheme } from 'react-twitter-login';

interface TwitterLoginButtonProps {
    theme: TwitterLoginButtonTheme;
}

const TwitterLoginButton: React.FC<TwitterLoginButtonProps> = ({theme}) => {
    const authHandler = (err: any, data: any) => {
        console.log(err, data);
    };

    return (
        <div>
            <TwitterLogin
                authCallback={authHandler}
                consumerKey={process.env.REACT_APP_TWITTER_CONSUMER_KEY || ''}
                consumerSecret={process.env.REACT_APP_TWITTER_CONSUMER_SECRET || ''}
                buttonTheme={theme}
            />
        </div>
    );
};

export default TwitterLoginButton;
