import Button from "../components/shared/Button";
import TwitterLoginButton from "../components/shared/TwitterLogin";

export default () => {

    return (
        <div className="navbar flex items-center justify-center pt-[47px] pl-[55px]">
            <div className="navbar-start">
                <img src={require('../../public/social_tw_logo.svg')} alt="UniRep logo" />
                <a className="text-[32px] text-white font-inter font-medium">Unirep Social TW</a>
            </div>
            <div className="navbar-end pr-[57px] space-x-[19px]">
                <Button color={`bg-btn-signup`} text={`登入`} />
                <Button color={`bg-btn-login`} text={`註冊`} />
                <div>
                    <TwitterLoginButton />
                </div>
            </div>
        </div>
    )
}
