import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import db from '@/lib/db';
import { RowDataPacket } from 'mysql2';
import { calculateBankResults } from '@/utils/banks';
import { getQuestionLabel } from '@/utils/questionLabels';
import { getUserIdFromRequest } from '@/lib/auth-helpers';

const ADMIN_WHATSAPP = '+237690984805';

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request);

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'Non authentifié' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { simulationId } = body;

    if (!simulationId) {
      return NextResponse.json(
        { success: false, message: 'ID de simulation manquant' },
        { status: 400 }
      );
    }

    // Récupérer les informations complètes de l'utilisateur
    const [users] = await db.query<RowDataPacket[]>(
      'SELECT id, name, email, phone FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    const user = users[0];

    // Récupérer la simulation complète
    const [simulations] = await db.query<RowDataPacket[]>(
      'SELECT * FROM simulations WHERE id = ? AND user_id = ?',
      [simulationId, userId]
    );

    if (simulations.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Simulation non trouvée' },
        { status: 404 }
      );
    }

    const simulation = simulations[0];
    const responses = simulation.responses;

    // Calculer les résultats des banques
    const bankResults = calculateBankResults(
      responses,
      simulation.montant_demande,
      `${simulation.duree_mois} mois`
    );

    const acceptedBanks = bankResults.filter(b => b.accepted);

    if (acceptedBanks.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Aucune banque n\'a accepté cette demande' },
        { status: 400 }
      );
    }

    // Générer le texte du message avec toutes les informations
    const message = generateWhatsAppMessage(user, simulation, responses, acceptedBanks);

    // Envoyer via WhatsApp (simulation - dans un vrai cas, utiliser l'API WhatsApp Business)
    console.log('=== MESSAGE WHATSAPP POUR ADMIN ===');
    console.log('Destinataire:', ADMIN_WHATSAPP);
    console.log('Message:');
    console.log(message);
    console.log('===================================');

    // Dans un environnement de production, vous utiliseriez l'API WhatsApp Business
    // Pour l'instant, nous générons juste un lien WhatsApp
    const whatsappUrl = `https://wa.me/${ADMIN_WHATSAPP.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;

    return NextResponse.json({
      success: true,
      message: 'Demande soumise avec succès',
      whatsappUrl: whatsappUrl,
      adminNumber: ADMIN_WHATSAPP,
    });

  } catch (error) {
    console.error('Erreur lors de la soumission:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

function generateWhatsAppMessage(
  user: any,
  simulation: any,
  responses: any,
  acceptedBanks: any[]
): string {
  const date = new Date(simulation.created_at).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  // Trier les banques par taux
  const sortedBanks = acceptedBanks.sort((a, b) => a.estimatedRate - b.estimatedRate);
  const bestBank = sortedBanks[0];

  let message = `🏦 *NOUVELLE DEMANDE DE CRÉDIT*\n\n`;
  message += `━━━━━━━━━━━━━━━━━━━━━━\n`;
  message += `📋 *INFORMATIONS CLIENT*\n`;
  message += `━━━━━━━━━━━━━━━━━━━━━━\n\n`;
  message += `👤 *Nom :* ${user.name}\n`;
  message += `📧 *Email :* ${user.email || 'Non renseigné'}\n`;
  message += `📱 *Téléphone :* ${user.phone || 'Non renseigné'}\n`;
  message += `📅 *Date de la demande :* ${date}\n\n`;

  message += `━━━━━━━━━━━━━━━━━━━━━━\n`;
  message += `💰 *DÉTAILS DU CRÉDIT*\n`;
  message += `━━━━━━━━━━━━━━━━━━━━━━\n\n`;
  message += `🏷️ *Type :* ${simulation.simulation_type.charAt(0).toUpperCase() + simulation.simulation_type.slice(1)}\n`;
  message += `💵 *Montant demandé :* ${simulation.montant_demande.toLocaleString('fr-FR')} €\n`;
  message += `⏱️ *Durée :* ${simulation.duree_mois} mois\n`;
  message += `📊 *Meilleur taux :* ${bestBank.estimatedRate}%\n`;
  message += `💳 *Mensualité :* ${(bestBank.monthlyPayment || 0).toLocaleString('fr-FR')} €\n`;
  message += `📈 *Coût total :* ${((bestBank.monthlyPayment || 0) * simulation.duree_mois).toLocaleString('fr-FR')} €\n`;
  message += `📋 *Frais d'ouverture de dossier :* ${(simulation.frais_ouverture || 0).toLocaleString('fr-FR')} €\n\n`;

  message += `━━━━━━━━━━━━━━━━━━━━━━\n`;
  message += `✅ *BANQUES ACCEPTANTES (${acceptedBanks.length})*\n`;
  message += `━━━━━━━━━━━━━━━━━━━━━━\n\n`;
  
  sortedBanks.forEach((result, index) => {
    message += `${index + 1}. *${result.bank.name}*\n`;
    message += `   • Taux : ${result.estimatedRate}%\n`;
    message += `   • Mensualité : ${(result.monthlyPayment || 0).toLocaleString('fr-FR')} €\n`;
    message += `   • Raison : ${result.reason}\n\n`;
  });

  message += `━━━━━━━━━━━━━━━━━━━━━━\n`;
  message += `👤 *PROFIL DU DEMANDEUR*\n`;
  message += `━━━━━━━━━━━━━━━━━━━━━━\n\n`;

  // Questions et réponses détaillées - Utiliser le mapping
  // Afficher toutes les réponses avec les vrais labels
  Object.keys(responses).forEach(key => {
    const value = responses[key];
    if (value === null || value === undefined || value === '') return;
    
    // Obtenir le label de la question
    const label = getQuestionLabel(key);
    
    let displayValue = '';
    
    // Formater la valeur
    if (typeof value === 'boolean') {
      displayValue = value ? 'Oui' : 'Non';
    } else if (typeof value === 'number') {
      displayValue = value.toLocaleString('fr-FR');
      const lowerLabel = label.toLowerCase();
      if (lowerLabel.includes('revenu') || lowerLabel.includes('montant') || 
          lowerLabel.includes('charge') || lowerLabel.includes('apport') || 
          lowerLabel.includes('épargne') || lowerLabel.includes('prix')) {
        displayValue += ' €';
      }
    } else {
      displayValue = String(value);
    }

    message += `*${label} :* ${displayValue}\n`;
  });

  message += `\n━━━━━━━━━━━━━━━━━━━━━━\n`;
  message += `⚠️ *ACTION REQUISE*\n`;
  message += `━━━━━━━━━━━━━━━━━━━━━━\n\n`;
  message += `📞 Merci de contacter le client pour vérifier les informations et demander les justificatifs nécessaires.\n\n`;
  message += `🔗 Simulateur Crédit - Administration`;

  return message;
}
