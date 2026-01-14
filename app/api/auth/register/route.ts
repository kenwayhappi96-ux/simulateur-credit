import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '@/lib/db';
import { RegisterData, AuthResponse } from '@/types/database';
import { RowDataPacket } from 'mysql2';
import { verifyEmailExists, isDisposableEmail } from '@/utils/emailVerification';

export async function POST(request: NextRequest) {
  try {
    const body: RegisterData = await request.json();
    const { name, email, phone, password, subscription_plan } = body;

    // Validation
    if (!name || !password || (!email && !phone)) {
      return NextResponse.json(
        { success: false, message: 'Nom, mot de passe et email ou téléphone requis' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Le mot de passe doit contenir au moins 6 caractères' },
        { status: 400 }
      );
    }

    // Validation email
    if (email) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return NextResponse.json(
          { success: false, message: 'Format email invalide' },
          { status: 400 }
        );
      }

      // Vérifier que l'email existe vraiment
      const emailVerification = await verifyEmailExists(email);
      if (!emailVerification.valid) {
        return NextResponse.json(
          { success: false, message: `Email invalide : ${emailVerification.message}` },
          { status: 400 }
        );
      }

      // Vérifier que ce n'est pas un email jetable
      if (isDisposableEmail(email)) {
        return NextResponse.json(
          { success: false, message: 'Les adresses email temporaires ne sont pas autorisées' },
          { status: 400 }
        );
      }
    }

    // Validation téléphone (format français uniquement)
    if (phone) {
      // Nettoyer le numéro pour la validation
      const cleanPhone = phone.replace(/[\s.-]/g, '');
      // Accepter : +33, 0033, ou 0 suivi de 6 ou 7 pour mobile
      const frenchPhoneRegex = /^(?:(?:\+|00)33|0)[67]\d{8}$/;
      if (!frenchPhoneRegex.test(cleanPhone)) {
        return NextResponse.json(
          { success: false, message: 'Numéro de téléphone français invalide. Formats acceptés : 06/07 XX XX XX XX ou +33 6/7 XX XX XX XX' },
          { status: 400 }
        );
      }
    }

    // Vérifier si l'utilisateur existe déjà
    const [existingUsers] = await db.query<RowDataPacket[]>(
      'SELECT id FROM users WHERE email = ? OR phone = ?',
      [email || null, phone || null]
    );

    if (existingUsers.length > 0) {
      return NextResponse.json(
        { success: false, message: 'Cet email ou numéro est déjà utilisé' },
        { status: 409 }
      );
    }

    // Hash du mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insertion de l'utilisateur
    const [result] = await db.query(
      `INSERT INTO users (name, email, phone, password, subscription_plan, last_reset_date) 
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [name, email || null, phone || null, hashedPassword, subscription_plan || 'gratuit']
    );

    const userId = (result as any).insertId;

    // Récupérer l'utilisateur créé
    const [users] = await db.query<RowDataPacket[]>(
      'SELECT id, name, email, phone, subscription_plan, simulations_count, created_at FROM users WHERE id = ?',
      [userId]
    );

    const user = users[0];

    // Créer le token JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email, phone: user.phone },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '30d' }
    );

    const response: AuthResponse = {
      success: true,
      message: 'Inscription réussie',
      user: user as any,
      token: token,
    };

    // Définir le cookie avec le token
    const nextResponse = NextResponse.json(response, { status: 201 });
    nextResponse.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 jours
      path: '/',
    });

    return nextResponse;
  } catch (error) {
    console.error('Erreur inscription:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur serveur lors de l\'inscription' },
      { status: 500 }
    );
  }
}
