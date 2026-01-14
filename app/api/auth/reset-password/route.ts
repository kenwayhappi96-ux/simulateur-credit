import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { identifier, code, newPassword } = body;

    // Validation
    if (!identifier || !code || !newPassword) {
      return NextResponse.json(
        { error: 'Tous les champs sont requis' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Le mot de passe doit contenir au moins 6 caractères' },
        { status: 400 }
      );
    }

    // Vérifier si c'est un email ou un numéro de téléphone
    const isEmail = identifier.includes('@');
    
    // Chercher l'utilisateur
    const [users]: any = isEmail
      ? await pool.execute('SELECT * FROM users WHERE email = ?', [identifier])
      : await pool.execute('SELECT * FROM users WHERE phone = ?', [identifier]);

    if (users.length === 0) {
      return NextResponse.json(
        { error: 'Utilisateur introuvable' },
        { status: 404 }
      );
    }

    const user = users[0];

    // Vérifier le code
    const [codes]: any = await pool.execute(
      `SELECT * FROM password_reset_codes 
       WHERE user_id = ? AND code = ? AND used = FALSE AND expires_at > NOW()
       ORDER BY created_at DESC LIMIT 1`,
      [user.id, code]
    );

    if (codes.length === 0) {
      return NextResponse.json(
        { error: 'Code invalide ou expiré' },
        { status: 400 }
      );
    }

    // Hasher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Mettre à jour le mot de passe
    await pool.execute(
      'UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?',
      [hashedPassword, user.id]
    );

    // Marquer le code comme utilisé
    await pool.execute(
      'UPDATE password_reset_codes SET used = TRUE WHERE id = ?',
      [codes[0].id]
    );

    return NextResponse.json({
      message: 'Mot de passe réinitialisé avec succès',
    });
  } catch (error) {
    console.error('Erreur reset-password:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
