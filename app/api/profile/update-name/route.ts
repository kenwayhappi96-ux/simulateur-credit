import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
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
    const { name } = body;

    // Validation
    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, message: 'Le nom ne peut pas être vide' },
        { status: 400 }
      );
    }

    // Mise à jour du nom (pas besoin de vérifier le mot de passe)
    await db.query(
      'UPDATE users SET name = ? WHERE id = ?',
      [name.trim(), userId]
    );

    return NextResponse.json({
      success: true,
      message: 'Nom mis à jour avec succès',
    });
  } catch (error) {
    console.error('Erreur mise à jour nom:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
