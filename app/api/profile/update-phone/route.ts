import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import db from '@/lib/db';
import { RowDataPacket } from 'mysql2';
import { getUserIdFromRequest } from '@/lib/auth-helpers';

interface UpdatePhoneRequest {
  phone: string;
  currentPassword?: string;
}

export async function PUT(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request);

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'Non authentifié' },
        { status: 401 }
      );
    }

    const body: UpdatePhoneRequest = await request.json();
    const { phone, currentPassword } = body;

    // Validation du nouveau numéro
    if (!phone || !phone.trim()) {
      return NextResponse.json(
        { success: false, message: 'Le numéro de téléphone est requis' },
        { status: 400 }
      );
    }

    // Validation format français (mobile uniquement)
    const cleanPhone = phone.replace(/[\s.-]/g, '');
    const frenchPhoneRegex = /^(?:(?:\+|00)33|0)[67]\d{8}$/;
    if (!frenchPhoneRegex.test(cleanPhone)) {
      return NextResponse.json(
        { success: false, message: 'Numéro de téléphone français invalide. Formats acceptés : 06/07 XX XX XX XX ou +33 6/7 XX XX XX XX' },
        { status: 400 }
      );
    }

    // Récupérer l'utilisateur actuel
    const [users] = await db.query<RowDataPacket[]>(
      'SELECT id, email, phone, password FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    const user = users[0];

    // Si l'utilisateur a déjà un numéro de téléphone, il doit fournir son mot de passe
    if (user.phone && currentPassword) {
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isPasswordValid) {
        return NextResponse.json(
          { success: false, message: 'Mot de passe incorrect' },
          { status: 401 }
        );
      }
    } else if (user.phone && !currentPassword) {
      // Si l'utilisateur a déjà un numéro mais n'a pas fourni de mot de passe
      return NextResponse.json(
        { success: false, message: 'Mot de passe requis pour modifier un numéro existant' },
        { status: 400 }
      );
    }

    // Vérifier si le numéro est déjà utilisé par un autre utilisateur
    const [existingPhone] = await db.query<RowDataPacket[]>(
      'SELECT id FROM users WHERE phone = ? AND id != ?',
      [phone, userId]
    );

    if (existingPhone.length > 0) {
      return NextResponse.json(
        { success: false, message: 'Ce numéro de téléphone est déjà utilisé' },
        { status: 409 }
      );
    }

    // Mettre à jour le numéro
    await db.query(
      'UPDATE users SET phone = ?, updated_at = NOW() WHERE id = ?',
      [phone, userId]
    );

    return NextResponse.json({
      success: true,
      message: 'Numéro WhatsApp mis à jour avec succès',
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour du numéro:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
