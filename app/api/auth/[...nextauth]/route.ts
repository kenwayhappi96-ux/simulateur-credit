import NextAuth, { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import db from '@/lib/db';
import bcrypt from 'bcryptjs';
import { RowDataPacket } from 'mysql2';

interface UserRow extends RowDataPacket {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  password: string;
  subscription_plan: string;
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        identifier: { label: 'Email ou Téléphone', type: 'text' },
        password: { label: 'Mot de passe', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.identifier || !credentials?.password) {
          return null;
        }

        try {
          const identifier = credentials.identifier;
          let query = 'SELECT * FROM users WHERE ';
          const isEmail = identifier.includes('@');
          if (isEmail) {
            query += 'email = ?';
          } else {
            query += 'phone = ?';
          }

          const [rows] = await db.execute<UserRow[]>(query, [identifier]);
          if (rows.length === 0) return null;

          const user = rows[0];
          const isValid = await bcrypt.compare(credentials.password, user.password);
          if (!isValid) return null;

          return {
            id: user.id.toString(),
            name: user.name,
            email: user.email || '',
            phone: user.phone || '',
            subscription_plan: user.subscription_plan,
          };
        } catch (error) {
          console.error('Error during authentication:', error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        try {
          const [existingUsers] = await db.execute<UserRow[]>(
            'SELECT * FROM users WHERE email = ?',
            [user.email]
          );

          if (existingUsers.length === 0) {
            // Compte n'existe pas - le créer automatiquement
            // (Google OAuth crée toujours le compte automatiquement)
            const emailName = user.email?.split('@')[0] || 'User';
            const nameParts = emailName.split(/[._-]/);
            const formattedName = nameParts
              .map(part => part.charAt(0).toUpperCase() + part.slice(1))
              .join(' ');

            // Mot de passe par défaut GoogleUser123!
            const defaultPassword = await bcrypt.hash('GoogleUser123!', 10);

            await db.execute(
              'INSERT INTO users (name, email, password, subscription_plan, created_at) VALUES (?, ?, ?, ?, NOW())',
              [formattedName, user.email, defaultPassword, 'gratuit']
            );
          }
          return true;
        } catch (error) {
          console.error('Error during Google sign in:', error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      // Si c'est une première connexion (user est défini)
      if (user) {
        token.id = user.id;
        token.subscription_plan = (user as any).subscription_plan;
      }
      
      // Pour les connexions Google, récupérer les données depuis la BD
      if (account?.provider === 'google' || token.email) {
        try {
          const [rows] = await db.execute<UserRow[]>(
            'SELECT * FROM users WHERE email = ?',
            [token.email]
          );
          
          if (rows.length > 0) {
            const dbUser = rows[0];
            token.id = dbUser.id.toString();
            token.name = dbUser.name;
            token.email = dbUser.email;
            token.subscription_plan = dbUser.subscription_plan;
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
      
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).subscription_plan = token.subscription_plan;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
