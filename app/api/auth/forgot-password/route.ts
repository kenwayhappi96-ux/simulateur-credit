import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// Fonction pour générer un code aléatoire à 6 chiffres
function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Fonction pour envoyer le code par email (simulation)
async function sendCodeByEmail(email: string, code: string): Promise<boolean> {
  console.log(`📧 EMAIL envoyé à ${email} avec le code: ${code}`);
  // TODO: Intégrer un vrai service d'email (SendGrid, Mailgun, etc.)
  return true;
}

// Fonction pour envoyer le code par SMS (simulation)
async function sendCodeBySMS(phone: string, code: string): Promise<boolean> {
  console.log(`📱 SMS envoyé au ${phone} avec le code: ${code}`);
  // TODO: Intégrer un vrai service SMS (Twilio, etc.)
  return true;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { identifier } = body; // email ou téléphone

    if (!identifier) {
      return NextResponse.json(
        { error: 'Email ou numéro de téléphone requis' },
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
        { error: 'Aucun compte trouvé avec cet identifiant' },
        { status: 404 }
      );
    }

    const user = users[0];

    // Générer un code à 6 chiffres
    const code = generateCode();

    // Définir l'expiration (15 minutes)
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    // Supprimer les anciens codes non utilisés de cet utilisateur
    await pool.execute(
      'DELETE FROM password_reset_codes WHERE user_id = ? AND used = FALSE',
      [user.id]
    );

    // Sauvegarder le code dans la base de données
    await pool.execute(
      'INSERT INTO password_reset_codes (user_id, code, expires_at) VALUES (?, ?, ?)',
      [user.id, code, expiresAt]
    );

    // Envoyer le code par email ou SMS
    let sent = false;
    if (isEmail) {
      sent = await sendCodeByEmail(identifier, code);
    } else {
      sent = await sendCodeBySMS(identifier, code);
    }

    if (!sent) {
      return NextResponse.json(
        { error: "Erreur lors de l'envoi du code" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: `Code de vérification envoyé à ${isEmail ? 'votre email' : 'votre téléphone'}`,
      method: isEmail ? 'email' : 'sms',
    });
  } catch (error) {
    console.error('Erreur forgot-password:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
