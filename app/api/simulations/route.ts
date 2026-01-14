import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import db from '@/lib/db';
import { RowDataPacket } from 'mysql2';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { getUserIdFromRequest } from '@/lib/auth-helpers';

// Récupérer toutes les simulations de l'utilisateur
export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request);

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'Non authentifié' },
        { status: 401 }
      );
    }

    const [simulations] = await db.query<RowDataPacket[]>(
      'SELECT * FROM simulations WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );

    return NextResponse.json({
      success: true,
      simulations: simulations,
    });
  } catch (error) {
    console.error('Erreur récupération simulations:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// Créer une nouvelle simulation
export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request);

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'Non authentifié' },
        { status: 401 }
      );
    }

    // Récupérer les infos utilisateur avec le plan
    const [users] = await db.query<RowDataPacket[]>(
      'SELECT * FROM user_subscription_info WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    const user = users[0];

    // Vérifier si l'utilisateur a encore des simulations disponibles
    if (user.simulations_per_month !== null && user.simulations_remaining <= 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Vous avez atteint la limite de simulations pour ce mois. Passez au Pack Illimité pour continuer.',
          limit_reached: true 
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    console.log('=== API SIMULATIONS POST ===');
    console.log('Body reçu:', body);
    
    const { 
      simulation_type, 
      montant_demande, 
      duree_mois, 
      taux_applique, 
      mensualite, 
      cout_total, 
      frais_ouverture,
      responses 
    } = body;

    console.log('simulation_type:', simulation_type, typeof simulation_type);
    console.log('montant_demande:', montant_demande, typeof montant_demande);
    console.log('duree_mois:', duree_mois, typeof duree_mois);

    // Validation
    if (!simulation_type || !montant_demande || !duree_mois) {
      console.error('VALIDATION ÉCHOUÉE - Champs manquants:', {
        simulation_type: !simulation_type ? 'MANQUANT' : 'OK',
        montant_demande: !montant_demande ? 'MANQUANT' : 'OK',
        duree_mois: !duree_mois ? 'MANQUANT' : 'OK',
      });
      return NextResponse.json(
        { success: false, message: 'Données de simulation incomplètes' },
        { status: 400 }
      );
    }
    console.log('Validation OK - Insertion dans la BD...');

    // Vérifier la limite de montant selon le pack
    if (montant_demande > user.max_loan_amount) {
      return NextResponse.json(
        { 
          success: false, 
          message: `Le montant demandé dépasse la limite de votre pack (${user.max_loan_amount}€). Passez au Pack Illimité pour emprunter jusqu'à 200 000€.`,
          amount_exceeded: true 
        },
        { status: 403 }
      );
    }

    // Vérifier s'il existe une simulation identique dans les 10 dernières secondes (éviter les doublons)
    const [recentSims] = await db.query<RowDataPacket[]>(
      `SELECT id FROM simulations 
       WHERE user_id = ? 
       AND simulation_type = ? 
       AND montant_demande = ? 
       AND duree_mois = ? 
       AND created_at >= DATE_SUB(NOW(), INTERVAL 10 SECOND)
       LIMIT 1`,
      [userId, simulation_type, montant_demande, duree_mois]
    );

    if (recentSims.length > 0) {
      console.log('⚠️ Simulation en doublon détectée - Ignorée');
      // Retourner succès mais sans insérer
      return NextResponse.json({
        success: true,
        message: 'Simulation déjà enregistrée',
        user: user,
        duplicate: true
      }, { status: 200 });
    }

    // Insérer la simulation
    await db.query(
      `INSERT INTO simulations 
       (user_id, simulation_type, montant_demande, duree_mois, taux_applique, mensualite, cout_total, frais_ouverture, responses) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, simulation_type, montant_demande, duree_mois, taux_applique, mensualite, cout_total, frais_ouverture, JSON.stringify(responses)]
    );

    // Incrémenter le compteur de simulations
    await db.query(
      'UPDATE users SET simulations_count = simulations_count + 1 WHERE id = ?',
      [userId]
    );

    // Récupérer les nouvelles infos utilisateur
    const [updatedUsers] = await db.query<RowDataPacket[]>(
      'SELECT * FROM user_subscription_info WHERE id = ?',
      [userId]
    );

    return NextResponse.json({
      success: true,
      message: 'Simulation enregistrée avec succès',
      user: updatedUsers[0],
    }, { status: 201 });
  } catch (error) {
    console.error('Erreur création simulation:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// Supprimer une simulation
export async function DELETE(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request);

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'Non authentifié' },
        { status: 401 }
      );
    }

    // Récupérer l'ID de la simulation à supprimer depuis l'URL
    const { searchParams } = new URL(request.url);
    const simulationId = searchParams.get('id');

    if (!simulationId) {
      return NextResponse.json(
        { success: false, message: 'ID de simulation manquant' },
        { status: 400 }
      );
    }

    // Vérifier que la simulation appartient bien à l'utilisateur
    const [simulations] = await db.query<RowDataPacket[]>(
      'SELECT id FROM simulations WHERE id = ? AND user_id = ?',
      [simulationId, userId]
    );

    if (simulations.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Simulation non trouvée ou non autorisée' },
        { status: 404 }
      );
    }

    // Supprimer la simulation
    await db.query(
      'DELETE FROM simulations WHERE id = ? AND user_id = ?',
      [simulationId, userId]
    );

    // Décrémenter le compteur de simulations
    await db.query(
      'UPDATE users SET simulations_count = GREATEST(simulations_count - 1, 0) WHERE id = ?',
      [userId]
    );

    return NextResponse.json({
      success: true,
      message: 'Simulation supprimée avec succès',
    });
  } catch (error) {
    console.error('Erreur suppression simulation:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
