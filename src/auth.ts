import { SvelteKitAuth } from "@auth/sveltekit"
import Google from "@auth/sveltekit/providers/google"
import { AUTH_SECRET, AUTH_TRUST_HOST, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } from "$env/static/private";

export const { handle, signIn, signOut } = SvelteKitAuth({
  providers: [Google({
    clientId: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
  })],
  trustHost: Boolean(AUTH_TRUST_HOST),
  secret: AUTH_SECRET
})
