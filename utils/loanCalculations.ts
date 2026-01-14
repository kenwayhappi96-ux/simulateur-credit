import { UserSubscriptionInfo } from '@/types/database';

export interface LoanCalculation {
  montant_demande: number;
  duree_mois: number;
  taux_base: number; // Taux de base de la banque
  taux_applique: number; // Taux appliqué
  frais_ouverture: number; // Frais d'ouverture de dossier en euros
  mensualite: number;
  cout_total: number;
  cout_interet: number;
}

/**
 * Calcule les frais d'ouverture de dossier selon le montant
 * - Jusqu'à 75 000€ : 5% fixe
 * - Au-delà de 75 000€ : dégressif de 5% à 10%
 */
function calculateFraisOuverture(montant: number): number {
  if (montant <= 75000) {
    // 5% fixe jusqu'à 75 000€
    return montant * 0.05;
  } else {
    // Dégressif de 5% à 10% au-delà de 75 000€
    // Formule : 5% + progression selon le dépassement
    const depassement = montant - 75000;
    const maxDepassement = 125000; // 200 000 - 75 000
    const progressionTaux = Math.min(depassement / maxDepassement, 1) * 0.05; // Max +5%
    const tauxTotal = 0.05 + progressionTaux;
    return montant * tauxTotal;
  }
}

/**
 * Calcule les détails d'un crédit avec frais d'ouverture de dossier
 */
export function calculateLoan(
  montant: number,
  dureeMois: number,
  tauxBase: number, // Taux annuel en %
  user: UserSubscriptionInfo
): LoanCalculation {
  // Montant à financer
  const montantDemande = montant;
  
  // Calculer les frais d'ouverture de dossier
  const fraisOuverture = calculateFraisOuverture(montantDemande);
  
  // Le taux appliqué reste le taux de base (les frais sont séparés)
  const tauxApplique = tauxBase;
  const tauxMensuel = tauxApplique / 12 / 100;
  
  // Calculer la mensualité avec la formule standard du crédit amortissable
  let mensualite: number;
  
  if (tauxMensuel === 0) {
    // Si pas d'intérêts (cas rare)
    mensualite = montantDemande / dureeMois;
  } else {
    // Formule : M = C × (t / (1 - (1 + t)^(-n)))
    mensualite = montantDemande * (tauxMensuel / (1 - Math.pow(1 + tauxMensuel, -dureeMois)));
  }
  
  // Coût total du crédit
  const coutTotal = mensualite * dureeMois;
  
  // Coût des intérêts
  const coutInteret = coutTotal - montantDemande;
  
  return {
    montant_demande: Math.round(montantDemande * 100) / 100,
    duree_mois: dureeMois,
    taux_base: Math.round(tauxBase * 100) / 100,
    taux_applique: Math.round(tauxApplique * 100) / 100,
    frais_ouverture: Math.round(fraisOuverture * 100) / 100, // Frais d'ouverture de dossier
    mensualite: Math.round(mensualite * 100) / 100,
    cout_total: Math.round(coutTotal * 100) / 100,
    cout_interet: Math.round(coutInteret * 100) / 100,
  };
}

/**
 * Obtient le taux de base d'une banque selon le type de crédit et la durée
 */
export function getBankRate(creditType: string, dureeMois: number): number {
  // Taux indicatifs (à ajuster selon les vraies banques)
  const rates: Record<string, { min: number; max: number }> = {
    'vehicule': { min: 2.9, max: 6.5 },
    'travaux': { min: 3.2, max: 7.0 },
    'equipement': { min: 3.5, max: 7.5 },
    'argent': { min: 4.0, max: 8.5 },
  };
  
  const rateRange = rates[creditType] || rates['argent'];
  
  // Plus la durée est longue, plus le taux est élevé
  const durationFactor = Math.min(dureeMois / 84, 1); // Normaliser sur 84 mois max
  const rate = rateRange.min + (rateRange.max - rateRange.min) * durationFactor;
  
  return Math.round(rate * 100) / 100;
}

/**
 * Vérifie si l'utilisateur peut faire une simulation
 */
export function canSimulate(user: UserSubscriptionInfo): {
  canSimulate: boolean;
  reason?: string;
} {
  // Pack illimité : toujours possible
  if (user.subscription_plan === 'illimite') {
    return { canSimulate: true };
  }
  
  // Pack gratuit : vérifier le nombre de simulations restantes
  if (user.simulations_remaining <= 0) {
    return {
      canSimulate: false,
      reason: 'Vous avez atteint la limite de 3 simulations ce mois. Passez au Pack Illimité pour continuer.',
    };
  }
  
  return { canSimulate: true };
}

/**
 * Vérifie si le montant demandé est autorisé pour le pack
 */
export function isAmountAllowed(montant: number, user: UserSubscriptionInfo): {
  allowed: boolean;
  reason?: string;
} {
  if (montant > user.max_loan_amount) {
    return {
      allowed: false,
      reason: `Le montant demandé (${montant.toLocaleString('fr-FR')}€) dépasse la limite de votre pack (${user.max_loan_amount.toLocaleString('fr-FR')}€). Passez au Pack Illimité pour emprunter jusqu'à 200 000€.`,
    };
  }
  
  return { allowed: true };
}
