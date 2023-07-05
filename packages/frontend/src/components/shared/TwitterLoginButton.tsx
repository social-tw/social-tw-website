import { useEffect, useState } from "react";
import { IconType } from "react-icons";
import { useNavigate } from "react-router-dom";
import axios from "axios";

interface TwitterLoginButtonProps {
    icon: IconType;
}

const TwitterLoginButton: React.FC<TwitterLoginButtonProps> = ({
    icon: Icon,
}) => {
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const navigate = useNavigate()
    const [user, setUser] = useState(null);

  const handleTwitterLogin = async () => {
    // Fetch login URL
    const response = await axios.get("http://localhost:8000/api/login");
    const loginUrl = response.data;

    // Redirect to login URL
    window.location.href = loginUrl;
  };

  const handleCallback = async (code: string, state: string, codeVerifier: string) => {
    const response = await axios.post("http://localhost:8000/api/user", {
      state,
      code,
      code_verifier: codeVerifier
    });
    setUser(response.data);
  };

  // Extracting query parameters from the URL
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get("code");
  const state = urlParams.get("state");
  const codeVerifier = ""; // You need to implement how to generate and store the code verifier

  if (code && state) {
    handleCallback(code, state, codeVerifier);
  }
    
    return (
        <button
            type="button"
            onClick={handleTwitterLogin}
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
