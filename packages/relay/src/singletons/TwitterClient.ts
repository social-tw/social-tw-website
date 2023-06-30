import { Client, auth } from "twitter-api-sdk";
import { CALLBACK_TEST_URL, TWITTER_CLIENT_ID, TWITTER_CLIENT_KEY } from '../config';

const authClient = new auth.OAuth2User({
  client_id: TWITTER_CLIENT_ID as string,
  client_secret: TWITTER_CLIENT_KEY as string,
  callback: CALLBACK_TEST_URL,
  scopes: ["tweet.read", "users.read", "offline.access"],
});

const client = new Client(authClient);

export default { authClient, client }