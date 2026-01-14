import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '@/lib/db';
import { LoginData, AuthResponse } from '@/types/database';
import { RowDataPacket } from 'mysql2';

export async function POST(request: NextRequest) {
  try {
    const body: LoginData = await request.json();
    const { identifier, password } = body;

    // Validation
    if (!identifier || !password) {
      return NextResponse.json(
        { success: false, message: 'Identifiant et mot de passe requis' },
        { status: 400 }
      );
    }

    // Chercher l'utilisateur par email ou téléphone
    const [users] = await db.query<RowDataPacket[]>(
      `SELECT id, name, email, phone, password, subscription_plan, simulations_count, 
              last_reset_date, created_at 
       FROM users 
       WHERE email = ? OR phone = ?`,
      [identifier, identifier]
    );

    if (users.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Identifiant ou mot de passe incorrect' },
        { status: 401 }
      );
    }

    const user = users[0];

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: 'Identifiant ou mot de passe incorrect' },
        { status: 401 }
      );
    }

    // Réinitialiser le compteur si on est dans un nouveau mois
    const lastReset = user.last_reset_date ? new Date(user.last_reset_date) : null;
    const now = new Date();
    const isNewMonth = !lastReset || 
      lastReset.getMonth() !== now.getMonth() || 
      lastReset.getFullYear() !== now.getFullYear();

    if (isNewMonth) {
      await db.query(
        'UPDATE users SET simulations_count = 0, last_reset_date = NOW() WHERE id = ?',
        [user.id]
      );
      user.simulations_count = 0;
    }

    // Créer le token JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email, phone: user.phone },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '30d' }
    );

    // Retirer le mot de passe de la réponse
    const { password: _, ...userWithoutPassword } = user;

    const response: AuthResponse = {
      success: true,
      message: 'Connexion réussie',
      user: userWithoutPassword as any,
      token: token,
    };

    // Définir le cookie avec le token
    const nextResponse = NextResponse.json(response, { status: 200 });
    nextResponse.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 jours
      path: '/',
    });

    return nextResponse;
  } catch (error) {
    console.error('Erreur connexion:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur serveur lors de la connexion' },
      { status: 500 }
    );
  }
}
