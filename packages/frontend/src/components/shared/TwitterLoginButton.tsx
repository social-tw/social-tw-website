import { useEffect, useState } from "react";
import { IconType } from "react-icons";
import { useNavigate } from "react-router-dom";

interface TwitterLoginButtonProps {
    icon: IconType;
}

const TwitterLoginButton: React.FC<TwitterLoginButtonProps> = ({
    icon: Icon,
}) => {
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const navigate = useNavigate()
    const [oauthToken, setOauthToken] = useState('');
    const [oauthTokenSecret, setOauthTokenSecret] = useState('');

    const getRequestToken = async () => {
        // Make a backend call to get the request token from Twitter
        const response = await fetch('http://localhost:8000/api/login', {
            method: 'GET',
        });

        const data = await response.json();

        setOauthToken(data.oauth_token);
        setOauthTokenSecret(data.oauth_token_secret);

        // Redirect the user to Twitter for authorization
        window.location.href = `https://api.twitter.com/oauth/authenticate?oauth_token=${data.oauth_token}`;
    }

    const getAccessToken = async (oauthVerifier: any) => {
        // Make a backend call to exchange the request token for an access token
        const response = await fetch('http://localhost:8000/api/user', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                oauth_token: oauthToken,
                oauth_verifier: oauthVerifier,
            }),
        });

        const data = await response.json();

        // Now you have the access token and can use it to access user data
        console.log(data);
    }

    const handleTwitterLogin = () => {
        getRequestToken();
    }

    // When the component mounts, check if the oauth_verifier is in the URL
    // If it is, then this is the redirect from Twitter and we need to get the access token
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const oauthVerifier = urlParams.get('oauth_verifier');

        if (oauthVerifier) {
            getAccessToken(oauthVerifier);
        }
    }, []);
    
    return (
        <button
            type="button"
            onClick={() => handleTwitterLogin()}
            className="
        inline-flex
        w-full
        justify-center
        items-center
        gap-4
        rounded-md
        bg-blue-400
        px-4
        py-2
        text-white
        hover:bg-gray-500
        focus:outline-offset-0
      "
        >
            <Icon />
            <span>Login</span>
        </button>
    );
};

export default TwitterLoginButton;
