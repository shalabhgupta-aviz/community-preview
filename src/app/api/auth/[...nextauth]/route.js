import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import LinkedInProvider from 'next-auth/providers/linkedin'
import { fetcher } from '../../../../lib/fetcher'

const {
  WP_URL,
  NEXTAUTH_SECRET
} = process.env

export const authOptions = {
  secret: NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId:     process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge:   30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    // 🔗 1) on signIn, call your WP social-login endpoint
    async signIn({ user, account }) {
      // account.provider === 'google' or 'linkedin'
      const idToken = account.id_token || account.access_token
      if (!idToken) return false

      const res = await fetcher(
        `${WP_URL}/wp-json/community/v1/social-login`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            provider: account.provider,
            id_token: idToken
          })
        }
      )
      if (res.error) {
        console.error('WP social-login failed', res.error)
        return false
      }

      const { token: wpJwt, user: wpUser } = res

      // Attach the WP JWT and user data onto the NextAuth user object
      user.wpJwt  = wpJwt
      user.wpUser = wpUser

      return true
    },

    // 🛡️ 2) in the jwt callback, persist wpJwt/wpUser into the token
    async jwt({ token, user }) {
      if (user?.wpJwt) {
        token.wpJwt  = user.wpJwt
        token.wpUser = user.wpUser
      }
      return token
    },

    // 👀 3) finally, expose them in your client session
    async session({ session, token }) {
      console.log('session', session);
      console.log('token', token);
      session.wpJwt  = token.wpJwt
      session.user   = token.wpUser
      return session
    }
  }
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }