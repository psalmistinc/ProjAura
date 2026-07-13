import NextAuth from 'next-auth';
import type { NextAuthConfig } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

export const authOptions: NextAuthConfig = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // In production, validate against DB
        // For now, mock authentication
        if (
          credentials.email === 'admin@aura.gov.gh' &&
          credentials.password === 'password'
        ) {
          return {
            id: 'usr-001',
            email: 'admin@aura.gov.gh',
            name: 'Aura Admin',
            role: 'ADMIN',
            orgId: 'org-001',
          };
        }

        return null;
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }: { token: any; user: any }) {
      if (user) {
        token.role = user.role;
        token.orgId = user.orgId;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (session.user) {
        session.user.role = token.role;
        session.user.orgId = token.orgId;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export async function auth() {
  // Placeholder — in production, use NextAuth's getServerSession
  return {
    user: {
      id: 'usr-001',
      email: 'admin@aura.gov.gh',
      name: 'Aura Admin',
      role: 'ADMIN',
      orgId: 'org-001',
    },
  };
}
