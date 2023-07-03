import React from "react";
import TwitterLogin from "react-twitter-login";

export default () => {
    const authHandler = (err: any, data: any) => {
        console.log(process.env.REACT_APP_TWITTER_CONSUMER_KEY);
        console.log(process.env.REACT_APP_TWITTER_CONSUMER_SECRET);
        console.log(err, data);
    };

    return (
        <TwitterLogin
            authCallback={authHandler}
            consumerKey={process.env.REACT_APP_TWITTER_CONSUMER_KEY || ''}
            consumerSecret={process.env.REACT_APP_TWITTER_CONSUMER_SECRET || ''}
            buttonTheme={'dark'}
        />
    );
};
