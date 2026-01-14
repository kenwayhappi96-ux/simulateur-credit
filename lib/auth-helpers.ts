import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import db from '@/lib/db';
import { RowDataPacket } from 'mysql2';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

/**
 * Récupère l'ID de l'utilisateur depuis une session NextAuth ou un token JWT
 * @param request La requête Next.js
 * @returns L'ID de l'utilisateur ou null si non authentifié
 */
export async function getUserIdFromRequest(request: NextRequest): Promise<number | null> {
  // PRIORITÉ 1 : Vérifier le token JWT custom d'abord (connexion classique ou nouveau compte)
  const token = request.cookies.get('auth-token')?.value;
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
      return decoded.userId;
    } catch (error) {
      // Token invalide, continuer avec NextAuth
    }
  }

  // PRIORITÉ 2 : Vérifier la session NextAuth (Google OAuth)
  const session = await getServerSession(authOptions);
  if (session?.user?.email) {
    const [users] = await db.query<RowDataPacket[]>(
      'SELECT id FROM users WHERE email = ?',
      [session.user.email]
    );
    if (users.length > 0) {
      return users[0].id;
    }
  }

  return null;
}
