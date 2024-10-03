import {createAuthClient} from 'better-auth/react';

export const client = createAuthClient({
  baseURL: process.env.AUTH_SERVICE_HOST,
});

export const {signUp, signIn, signOut, useSession, user} = client;
