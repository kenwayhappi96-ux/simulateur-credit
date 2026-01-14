import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import db from '@/lib/db';
import { RowDataPacket } from 'mysql2';
import { getUserIdFromRequest } from '@/lib/auth-helpers';

export async function PUT(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request);

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'Non authentifié' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { email, currentPassword } = body;

    // Validation
    if (!email || !email.trim()) {
      return NextResponse.json(
        { success: false, message: 'L\'email ne peut pas être vide' },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { success: false, message: 'Format d\'email invalide' },
        { status: 400 }
      );
    }

    if (!currentPassword) {
      return NextResponse.json(
        { success: false, message: 'Mot de passe actuel requis' },
        { status: 400 }
      );
    }

    // Récupérer l'utilisateur
    const [users] = await db.query<RowDataPacket[]>(
      'SELECT id, password FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    const user = users[0];

    // Vérifier le mot de passe actuel
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: 'Mot de passe incorrect' },
        { status: 401 }
      );
    }

    // Vérifier si l'email n'est pas déjà utilisé par un autre utilisateur
    const [existingUsers] = await db.query<RowDataPacket[]>(
      'SELECT id FROM users WHERE email = ? AND id != ?',
      [email, userId]
    );

    if (existingUsers.length > 0) {
      return NextResponse.json(
        { success: false, message: 'Cet email est déjà utilisé' },
        { status: 409 }
      );
    }

    // Mise à jour de l'email
    await db.query(
      'UPDATE users SET email = ? WHERE id = ?',
      [email.trim(), userId]
    );

    return NextResponse.json({
      success: true,
      message: 'Email mis à jour avec succès',
    });
  } catch (error) {
    console.error('Erreur mise à jour email:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
