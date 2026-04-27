import { NextAuthOptions } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { db } from './db';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const result = await db`SELECT * FROM users WHERE email = ${credentials.email}`;
        const user = result[0];
        if (!user) return null;

        const isValid = await bcrypt.compare(credentials.password, user.password_hash);
        if (!isValid) return null;

        // Return only what we need (email is the identifier)
        return { 
          id: user.email,   // Using email as ID since email is PK
          email: user.email 
        };
      }
    })
  ],
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.email = token.email as string;
        (session.user as any).id = token.id;
        
        // ✅ FIX: Verify admin email in every session and persist admin status
        const isAdminEmail = token.email === process.env.ADMIN_EMAIL;
        (session.user as any).isAdmin = isAdminEmail;
        (session.user as any).adminVerified = isAdminEmail;
        
        if (isAdminEmail) {
          console.log('✅ Admin session verified for:', token.email);
        }
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};