import {
    CALLBACK_TEST_URL,
    TWITTER_ACCESS_TOKEN_URL,
    TWITTER_CLIENT_ID,
    TWITTER_CLIENT_KEY,
    TWITTER_USER_URL,
} from '../config'

// we need to encrypt our twitter client id and secret here in base 64 (stated in twitter documentation)
const BasicAuthToken = Buffer.from(
    `${TWITTER_CLIENT_ID}:${TWITTER_CLIENT_KEY}`,
    'utf8'
).toString('base64')

// filling up the query parameters needed to request for getting the token
const twitterOauthTokenParams = {
    client_id: TWITTER_CLIENT_ID!,
    redirect_uri: CALLBACK_TEST_URL!,
    grant_type: 'authorization_code',
}

// the shape of the object we should recieve from twitter in the request
type TwitterTokenResponse = {
    token_type: 'bearer'
    expires_in: 7200
    access_token: string
    scope: string
    refresh_token: string
}

// the shape of the response we should get
interface TwitterUser {
    id: string
    name: string
    username: string
}

export default {
    // the main step 1 function, getting the access token from twitter using the code that the twitter sent us
    getTwitterOAuthToken: async (code: string, code_verifier: string) => {
        try {
            const twitterOauth2TokenUrl = `${TWITTER_ACCESS_TOKEN_URL}?${new URLSearchParams({
                ...twitterOauthTokenParams,
                code,
                code_verifier,
            }).toString()}`

            // POST request to the token url to get the access token
            const res = await fetch(twitterOauth2TokenUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    Authorization: `Basic ${BasicAuthToken}`,
                },
            })

            const data = await res.json()

            return data as TwitterTokenResponse
        } catch (err) {
            return null
        }
    },

    // getting the twitter user from access token
    getTwitterUser: async (accessToken: string) => {
        try {
            // request GET https://api.twitter.com/2/users/me
            const res = await fetch(TWITTER_USER_URL, {
                headers: {
                    'Content-type': 'application/json',
                    // put the access token in the Authorization Bearer token
                    Authorization: `Bearer ${accessToken}`,
                },
            })

            const data = await res.json()

            return data.data as TwitterUser ?? null
        } catch (err) {
            return null
        }
    },
}
