import { UserState } from '@unirep/core';
import LOGIN_ERROR_MESSAGES from '../constants/error-messages/loginErrorMessage';
import { SignupStatus } from '../contexts/User';

const useSignupWithServer = (
    accessToken: string | null,
    hashUserId: string | null,
    signMsg: string | null,
    navigate: (path: string) => void,
    setSignupStatus: (param: SignupStatus) => void,
    setErrorCode: (errorCode: keyof typeof LOGIN_ERROR_MESSAGES) => void,
    signup: (
        fromServer: boolean,
        userStateInstance: UserState,
        hashUserId: string,
        accessToken: string,
    ) => Promise<void>,
    setIsLogin: (param: string) => void,
    createUserState: () => Promise<UserState>,
) => {
    const signupWithServer = async () => {
        try {
            if (!hashUserId) {
                throw new Error(LOGIN_ERROR_MESSAGES.MISSING_ELEMENT.code);
            }
            localStorage.setItem('hashUserId', hashUserId);
            if (!signMsg) {
                throw new Error(LOGIN_ERROR_MESSAGES.MISSING_ELEMENT.code);
            }
            localStorage.setItem('signature', signMsg);
            if (!accessToken) {
                throw new Error(LOGIN_ERROR_MESSAGES.MISSING_ELEMENT.code);
            }
            localStorage.setItem('token', accessToken);
            const userStateInstance = await createUserState();
            setSignupStatus('pending');
            navigate('/');
            try {
                await signup(true, userStateInstance, hashUserId, accessToken);
            } catch (error: any) {
                throw new Error(LOGIN_ERROR_MESSAGES.SIGNUP_FAILED.code);
            }
            setSignupStatus('success');
            setIsLogin('success');
        } catch (error: any) {
            setSignupStatus('error');
            setErrorCode(error.message);
        }
    };

    return signupWithServer;
};

export default useSignupWithServer;
