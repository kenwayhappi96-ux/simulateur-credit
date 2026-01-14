import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import db from '@/lib/db';
import { RowDataPacket } from 'mysql2';
import { getServerSession } from 'next-auth';
import { authOptions } from '../[...nextauth]/route';

export async function GET(request: NextRequest) {
  try {
    // PRIORITÉ 1 : Vérifier le token JWT custom d'abord (connexion classique ou nouveau compte)
    const token = request.cookies.get('auth-token')?.value;

    if (token) {
      try {
        // Vérifier le token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;

        // Récupérer les infos utilisateur avec les détails du plan
        const [users] = await db.query<RowDataPacket[]>(
          'SELECT * FROM user_subscription_info WHERE id = ?',
          [decoded.userId]
        );

        if (users.length > 0) {
          return NextResponse.json({
            success: true,
            user: users[0],
          });
        }
      } catch (error) {
        // Token invalide, continuer avec NextAuth
      }
    }

    // PRIORITÉ 2 : Vérifier la session NextAuth (Google OAuth)
    const session = await getServerSession(authOptions);
    
    if (session?.user?.email) {
      // Récupérer les infos utilisateur depuis la BD avec l'email de la session NextAuth
      const [users] = await db.query<RowDataPacket[]>(
        'SELECT * FROM user_subscription_info WHERE email = ?',
        [session.user.email]
      );

      if (users.length > 0) {
        return NextResponse.json({
          success: true,
          user: users[0],
        });
      }
    }

    // Aucune authentification valide
    return NextResponse.json(
      { success: false, message: 'Non authentifié' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Erreur récupération profil:', error);
    return NextResponse.json(
      { success: false, message: 'Token invalide ou expiré' },
      { status: 401 }
    );
  }
}
