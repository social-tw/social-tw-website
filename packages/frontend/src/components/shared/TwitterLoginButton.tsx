import { useEffect, useState } from "react"
import { IconType } from "react-icons"
import { useNavigate } from "react-router-dom"

interface TwitterLoginButtonProps {
    icon: IconType
}

const TwitterLoginButton: React.FC<TwitterLoginButtonProps> = ({
    icon: Icon,
}) => {
    const navigate = useNavigate()
    const [hashUserId, setHashUserId] = useState('')

    const handleTwitterLogin = async () => {
        // Make a backend call to get the request token from Twitter
        const response = await fetch('http://localhost:8000/api/login', {
            method: 'GET',
        })

        const data = await response.json()

        // Redirect the user to Twitter for authorization
        window.location.href = data.url
    }

    // once redirect back, the hashUserId will carry in the param of url 
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search)
        const hashUserId = urlParams.get('code')
        
        if (hashUserId) {
            setHashUserId(hashUserId)
            // todo generate the identity
        }
    }, [])
    
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
    )
}

export default TwitterLoginButton