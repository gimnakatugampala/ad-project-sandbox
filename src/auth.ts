import NextAuth from  'next-auth'
import {PrismaAdapter} from '@auth/prisma-adapter'
import {prisma} from '@/lib/prisma'

import Google from 'next-auth/providers/google'

import {
  Role,
  UserStatus,
} from "@/generated/prisma/enums";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  secret: process.env.AUTH_SECRET,

  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
      authorization: {
        params: {
          prompt: "select_account",
        },
      },
    }),
  ],

  pages: {
    signIn: "/login",
  },

  session: {
    strategy: "database",
  },

 callbacks: {
  authorized({ auth, request: { nextUrl } }) {
    const isLoggedIn = Boolean(auth?.user);

    const isUserRoute =
      nextUrl.pathname.startsWith("/my-ads") ||
      nextUrl.pathname.startsWith("/ads/new");

    const isModeratorRoute =
      nextUrl.pathname.startsWith("/moderator");

    if (!isUserRoute && !isModeratorRoute) {
      return true;
    }

    if (!isLoggedIn) {
      return false;
    }

    if (auth.user.status !== UserStatus.ACTIVE) {
      return Response.redirect(
        new URL("/account", nextUrl)
      );
    }

    if (isModeratorRoute && auth.user.role !== Role.MODERATOR) {
      return Response.redirect(
        new URL("/account", nextUrl)
      );
    }

    return true;
  },

  session({ session, user }) {
    session.user.id = user.id;
    session.user.role = user.role;
    session.user.status = user.status;

    return session;
  },
},
});