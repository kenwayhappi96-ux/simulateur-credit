import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export async function GET() {
  try {
    const [plans] = await db.query<RowDataPacket[]>(
      'SELECT * FROM subscription_plans ORDER BY price ASC'
    );

    return NextResponse.json({
      success: true,
      plans: plans,
    });
  } catch (error) {
    console.error('Erreur récupération plans:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
