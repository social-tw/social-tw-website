export enum QueryKeys {
    RelayConfig = 'relay_config',
    UserState = 'user_state',
    HasSignedUp = 'has_signed_up',
    CurrentEpoch = 'current_epoch',
    EpochRemainingTime = 'epoch_remaining_time',
    Counter = 'counter',
    ManyPosts = 'many_posts',
    SinglePost = 'single_post',
    ManyComments = 'many_comments',
}

export enum MutationKeys {
    ReuestData = 'request_data',
    ProveData = 'prove_data',
    Login = 'login',
    LoginWithServer = 'login_with_server',
    LoginWithWallet = 'login_with_wallet',
    Logout = 'logout',
    Signup = 'signup',
    SignupWithServer = 'signup_with_server',
    SignupWithWallet = 'signup_with_wallet',
    UserStateTransition = 'user_state_transition',
    CreatePost = 'create_post',
    CreateComment = 'create_comment',
    RemoveComment = 'remove_comment',
    Vote = 'vote',
}
