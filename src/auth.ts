import NextAuth from  'next-auth'
import {PrismaAdapter} from '@auth/prisma-adapter'
import {prisma} from '@/lib/prisma'

import Google from 'next-auth/providers/google'

export const { handlers, auth, signIn, signOut } = NextAuth({
    adapter: PrismaAdapter(prisma),
    secret: process.env.AUTH_SECRET,
    providers: [ 
    Google({
    clientId: process.env.AUTH_GOOGLE_ID!,
    clientSecret: process.env.AUTH_GOOGLE_SECRET!,
  }),],
  callbacks: {
    session({ session, user }) {
        session.user.id = user.id;
        session.user.role = user.role;
        session.user.status = user.status;

        return session;
    },
    },
})