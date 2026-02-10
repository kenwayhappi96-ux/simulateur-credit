import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import db from '@/lib/db';
import { RowDataPacket } from 'mysql2';
import { calculateBankResults } from '@/utils/banks';
import { getQuestionLabel } from '@/utils/questionLabels';
import { jsPDF } from 'jspdf';
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

    // Générer le PDF avec jsPDF
    const pdfBuffer = generatePDF(user, simulation, responses, acceptedBanks);

    // Créer la réponse avec le PDF
    const response = new NextResponse(Buffer.from(pdfBuffer));
    response.headers.set('Content-Type', 'application/pdf');
    response.headers.set('Content-Disposition', `attachment; filename="demande-credit-${simulation.id}.pdf"`);

    return response;

  } catch (error: any) {
    console.error('Erreur lors de la génération du PDF:', error);
    console.error('Stack:', error.stack);
    return NextResponse.json(
      { success: false, message: 'Erreur serveur: ' + (error.message || 'Erreur inconnue') },
      { status: 500 }
    );
  }
}

function generatePDF(
  user: any,
  simulation: any,
  responses: any,
  acceptedBanks: any[]
): Uint8Array {
  const doc = new jsPDF();
  let yPos = 20;
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  const maxWidth = pageWidth - 2 * margin;

  // Helper pour ajouter du texte et gérer les nouvelles pages
  const addText = (text: string, size: number, style: 'normal' | 'bold' = 'normal', color: [number, number, number] = [0, 0, 0]) => {
    if (yPos > 270) {
      doc.addPage();
      yPos = 20;
    }
    doc.setFontSize(size);
    doc.setFont('helvetica', style);
    doc.setTextColor(color[0], color[1], color[2]);
    
    // Nettoyer le texte pour éviter les problèmes d'encodage
    const cleanText = text
      .replace(/€/g, 'EUR')
      .replace(/à/g, 'a')
      .replace(/â/g, 'a')
      .replace(/é/g, 'e')
      .replace(/è/g, 'e')
      .replace(/ê/g, 'e')
      .replace(/ë/g, 'e')
      .replace(/î/g, 'i')
      .replace(/ï/g, 'i')
      .replace(/ô/g, 'o')
      .replace(/ö/g, 'o')
      .replace(/û/g, 'u')
      .replace(/ù/g, 'u')
      .replace(/ü/g, 'u')
      .replace(/ç/g, 'c')
      .replace(/É/g, 'E')
      .replace(/È/g, 'E')
      .replace(/Ê/g, 'E')
      .replace(/À/g, 'A')
      .replace(/Ç/g, 'C');
    
    const lines = doc.splitTextToSize(cleanText, maxWidth);
    lines.forEach((line: string) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      doc.text(line, margin, yPos);
      yPos += size * 0.5;
    });
    yPos += 3;
  };

  const addSection = (title: string) => {
    yPos += 5;
    if (yPos > 260) {
      doc.addPage();
      yPos = 20;
    }
    
    // Nettoyer le titre
    const cleanTitle = title
      .replace(/É/g, 'E')
      .replace(/È/g, 'E')
      .replace(/Ê/g, 'E')
      .replace(/À/g, 'A')
      .replace(/Ç/g, 'C');
    
    doc.setFillColor(30, 64, 175);
    doc.rect(margin, yPos - 5, maxWidth, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(cleanTitle, margin + 2, yPos);
    doc.setTextColor(0, 0, 0);
    yPos += 10;
  };

  // Header
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('DEMANDE DE CREDIT', pageWidth / 2, yPos, { align: 'center' });
  yPos += 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Reference: #${simulation.id}`, pageWidth / 2, yPos, { align: 'center' });
  yPos += 5;
  doc.text(`Date: ${new Date(simulation.created_at).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })}`, pageWidth / 2, yPos, { align: 'center' });
  yPos += 15;

  // Section: Informations Client
  addSection('INFORMATIONS CLIENT');
  addText(`Nom: ${user.name}`, 11, 'bold');
  addText(`Email: ${user.email || 'Non renseigne'}`, 11);
  addText(`Telephone: ${user.phone || 'Non renseigne'}`, 11);

  // Section: Détails du Crédit
  addSection('DETAILS DU CREDIT');
  addText(`Type: ${simulation.simulation_type.charAt(0).toUpperCase() + simulation.simulation_type.slice(1)}`, 11, 'bold');
  addText(`Montant demande: ${simulation.montant_demande.toLocaleString('fr-FR')} EUR`, 11);
  addText(`Duree: ${simulation.duree_mois} mois`, 11);
  
  const sortedBanks = acceptedBanks.sort((a, b) => a.estimatedRate - b.estimatedRate);
  const bestBank = sortedBanks[0];
  addText(`Meilleur taux: ${bestBank.estimatedRate}%`, 11, 'bold', [0, 128, 0]);
  addText(`Mensualite: ${(bestBank.monthlyPayment || 0).toLocaleString('fr-FR')} EUR`, 11);
  addText(`Cout total: ${((bestBank.monthlyPayment || 0) * simulation.duree_mois).toLocaleString('fr-FR')} EUR`, 11);
  addText(`Frais d'ouverture de dossier: ${(simulation.frais_ouverture || 0).toLocaleString('fr-FR')} EUR`, 11, 'bold', [0, 100, 200]);

  // Section: Banques Acceptantes
  addSection(`BANQUES ACCEPTANTES (${acceptedBanks.length})`);
  sortedBanks.forEach((result, index) => {
    addText(`${index + 1}. ${result.bank.name}`, 11, 'bold');
    addText(`   Taux: ${result.estimatedRate}% | Mensualite: ${(result.monthlyPayment || 0).toLocaleString('fr-FR')} EUR`, 10);
    addText(`   ${result.reason}`, 10, 'normal', [100, 100, 100]);
  });

  // Section: Profil du Demandeur
  addSection('PROFIL DU DEMANDEUR');
  
  Object.keys(responses).forEach(key => {
    const value = responses[key];
    if (value === null || value === undefined || value === '') return;
    
    const label = getQuestionLabel(key);
    let displayValue = '';
    
    if (typeof value === 'boolean') {
      displayValue = value ? 'Oui' : 'Non';
    } else if (typeof value === 'number') {
      displayValue = value.toLocaleString('fr-FR');
      const lowerLabel = label.toLowerCase();
      if (lowerLabel.includes('revenu') || lowerLabel.includes('montant') || 
          lowerLabel.includes('charge') || lowerLabel.includes('apport') || 
          lowerLabel.includes('épargne') || lowerLabel.includes('prix')) {
        displayValue += ' EUR';
      } else if (lowerLabel.includes('âge')) {
        displayValue += ' ans';
      }
    } else {
      displayValue = String(value);
    }

    addText(`${label}: ${displayValue}`, 10);
  });

  // Footer
  yPos += 10;
  if (yPos > 250) {
    doc.addPage();
    yPos = 20;
  }
  
  doc.setFillColor(240, 240, 240);
  doc.rect(margin, yPos, maxWidth, 30, 'F');
  yPos += 8;
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('ACTION REQUISE', pageWidth / 2, yPos, { align: 'center' });
  yPos += 7;
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Merci de contacter le client pour verifier les informations', pageWidth / 2, yPos, { align: 'center' });
  yPos += 5;
  doc.text('et demander les justificatifs necessaires.', pageWidth / 2, yPos, { align: 'center' });
  yPos += 7;
  doc.setFontSize(8);
  doc.text(`Contact admin: ${ADMIN_WHATSAPP}`, pageWidth / 2, yPos, { align: 'center' });
  yPos += 5;
  doc.text('Simulateur Credit - Administration', pageWidth / 2, yPos, { align: 'center' });

  //return doc.output('arraybuffer');
  return new Uint8Array(doc.output('arraybuffer'));
}
