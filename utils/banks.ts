export interface Bank {
  id: string;
  name: string;
  logo: string;
  description: string;
  acceptanceRate: number; // Score minimum pour être accepté
  interestRate: {
    min: number;
    max: number;
  };
  maxAmount: number;
  maxDuration: number;
  conditions: {
    minIncome?: number;
    minSeniority?: number;
    maxDebtRatio?: number; // Ratio d'endettement max
    requiredDocuments?: string[];
  };
  advantages: string[];
  color: string;
}

export interface ScoringResult {
  bank: Bank;
  score: number;
  accepted: boolean;
  reason: string;
  estimatedRate: number;
  monthlyPayment?: number;
  conditions?: string[];
}

// Données des banques
export const banks: Bank[] = [
  {
    id: 'bnp',
    name: 'BNP Paribas',
    logo: '/banks/bnp.png',
    description: 'Banque traditionnelle avec des critères stricts',
    acceptanceRate: 70,
    interestRate: { min: 6.9, max: 9.2 },
    maxAmount: 75000,
    maxDuration: 84,
    conditions: {
      minIncome: 1800,
      minSeniority: 12, // mois
      maxDebtRatio: 33,
      requiredDocuments: ['fiches de paie', 'avis d\'imposition', 'RIB']
    },
    advantages: ['Taux compétitifs', 'Réseau d\'agences étendu', 'Assurance incluse'],
    color: 'bg-gradient-to-r from-green-600 to-emerald-700'
  },
  {
    id: 'ca',
    name: 'Crédit Agricole',
    logo: '/banks/ca.png',
    description: 'Banque régionale adaptée aux projets locaux',
    acceptanceRate: 65,
    interestRate: { min: 6.8, max: 9.2 },
    maxAmount: 60000,
    maxDuration: 72,
    conditions: {
      minIncome: 1600,
      minSeniority: 6,
      maxDebtRatio: 35,
      requiredDocuments: ['fiches de paie', 'justificatif de domicile']
    },
    advantages: ['Proximité géographique', 'Accompagnement personnalisé', 'Offres locales'],
    color: 'bg-gradient-to-r from-green-500 to-lime-600'
  },
  {
    id: 'societe',
    name: 'Société Générale',
    logo: '/banks/societe.png',
    description: 'Banque moderne avec processus digitalisé',
    acceptanceRate: 68,
    interestRate: { min: 6.6, max: 8.7 },
    maxAmount: 80000,
    maxDuration: 96,
    conditions: {
      minIncome: 1700,
      minSeniority: 3,
      maxDebtRatio: 40,
      requiredDocuments: ['pièce d\'identité', 'justificatif de revenus']
    },
    advantages: ['Démarche 100% en ligne', 'Décision rapide', 'Application mobile'],
    color: 'bg-gradient-to-r from-red-600 to-orange-600'
  },
  {
    id: 'lcl',
    name: 'LCL',
    logo: '/banks/lcl.png',
    description: 'Banque accessible pour les petits projets',
    acceptanceRate: 60,
    interestRate: { min: 7.0, max: 9.5 },
    maxAmount: 50000,
    maxDuration: 60,
    conditions: {
      minIncome: 1500,
      minSeniority: 0,
      maxDebtRatio: 45,
      requiredDocuments: ['fiches de paie des 3 derniers mois']
    },
    advantages: ['Critères flexibles', 'Premier crédit accepté', 'Accompagnement débutant'],
    color: 'bg-gradient-to-r from-blue-600 to-indigo-700'
  },
  {
    id: 'bourso',
    name: 'Boursorama',
    logo: '/banks/bourso.png',
    description: 'Banque en ligne avec taux attractifs',
    acceptanceRate: 75,
    interestRate: { min: 5.9, max: 7.9 },
    maxAmount: 100000,
    maxDuration: 84,
    conditions: {
      minIncome: 2000,
      minSeniority: 24,
      maxDebtRatio: 30,
      requiredDocuments: ['avis d\'imposition', 'relevés bancaires']
    },
    advantages: ['Meilleurs taux', 'Frais réduits', 'Service digital'],
    color: 'bg-gradient-to-r from-purple-600 to-pink-600'
  },
  {
    id: 'fortuneo',
    name: 'Fortuneo',
    logo: '/banks/fortuneo.png',
    description: 'Spécialiste crédit consommation',
    acceptanceRate: 72,
    interestRate: { min: 6.2, max: 8.3 },
    maxAmount: 75000,
    maxDuration: 84,
    conditions: {
      minIncome: 1900,
      minSeniority: 12,
      maxDebtRatio: 35,
      requiredDocuments: ['bulletins de salaire', 'contrat de travail']
    },
    advantages: ['Expert crédit conso', 'Assurance adaptative', 'Remboursement anticipé gratuit'],
    color: 'bg-gradient-to-r from-amber-600 to-yellow-600'
  },
  
  // ========== BANQUES ALLEMANDES ==========
  {
    id: 'deutsche-bank',
    name: 'Deutsche Bank',
    logo: '/banks/deutsche-bank.png',
    description: 'Première banque allemande, expertise internationale',
    acceptanceRate: 70,
    interestRate: { min: 6.8, max: 9.3 },
    maxAmount: 80000,
    maxDuration: 96,
    conditions: {
      minIncome: 2000,
      minSeniority: 18,
      maxDebtRatio: 35,
      requiredDocuments: ['Gehaltsabrechnungen', 'Arbeitsvertrag', 'Schufa-Auskunft']
    },
    advantages: ['Réseau mondial', 'Conseil premium', 'Services digitaux avancés'],
    color: 'bg-gradient-to-r from-blue-700 to-indigo-800'
  },
  {
    id: 'commerzbank',
    name: 'Commerzbank',
    logo: '/banks/commerzbank.png',
    description: 'Deuxième banque allemande, très compétitive',
    acceptanceRate: 68,
    interestRate: { min: 7.1, max: 9.7 },
    maxAmount: 65000,
    maxDuration: 84,
    conditions: {
      minIncome: 1800,
      minSeniority: 12,
      maxDebtRatio: 38,
      requiredDocuments: ['Einkommensnachweise', 'Identitätsnachweis']
    },
    advantages: ['Taux fixes attractifs', 'Remboursement flexible', 'Application mobile performante'],
    color: 'bg-gradient-to-r from-yellow-600 to-amber-700'
  },

  // ========== BANQUES ESPAGNOLES ==========
  {
    id: 'santander',
    name: 'Banco Santander',
    logo: '/banks/santander.png',
    description: 'Leader bancaire espagnol, présence mondiale',
    acceptanceRate: 72,
    interestRate: { min: 7.3, max: 10.2 },
    maxAmount: 70000,
    maxDuration: 96,
    conditions: {
      minIncome: 1600,
      minSeniority: 12,
      maxDebtRatio: 40,
      requiredDocuments: ['Nóminas', 'DNI/NIE', 'Contrato laboral']
    },
    advantages: ['Réseau international', 'Offres promotionnelles', 'Service client 24/7'],
    color: 'bg-gradient-to-r from-red-600 to-rose-700'
  },
  {
    id: 'bbva',
    name: 'BBVA',
    logo: '/banks/bbva.png',
    description: 'Banque innovante, leader digital en Espagne',
    acceptanceRate: 70,
    interestRate: { min: 7.6, max: 10.5 },
    maxAmount: 60000,
    maxDuration: 84,
    conditions: {
      minIncome: 1500,
      minSeniority: 6,
      maxDebtRatio: 42,
      requiredDocuments: ['Justificantes de ingresos', 'Documento de identidad']
    },
    advantages: ['100% digital', 'Approbation rapide', 'Innovation technologique'],
    color: 'bg-gradient-to-r from-blue-800 to-cyan-900'
  },

  // ========== BANQUES ITALIENNES ==========
  {
    id: 'intesa',
    name: 'Intesa Sanpaolo',
    logo: '/banks/intesa.png',
    description: 'Première banque italienne, très solide',
    acceptanceRate: 68,
    interestRate: { min: 7.0, max: 9.8 },
    maxAmount: 75000,
    maxDuration: 120,
    conditions: {
      minIncome: 1700,
      minSeniority: 12,
      maxDebtRatio: 35,
      requiredDocuments: ['Buste paga', 'Documento d\'identità', 'Codice fiscale']
    },
    advantages: ['Leader italien', 'Durées longues', 'Accompagnement personnalisé'],
    color: 'bg-gradient-to-r from-sky-700 to-blue-800'
  },
  {
    id: 'unicredit',
    name: 'UniCredit',
    logo: '/banks/unicredit.png',
    description: 'Groupe bancaire européen majeur',
    acceptanceRate: 66,
    interestRate: { min: 7.4, max: 10.1 },
    maxAmount: 65000,
    maxDuration: 96,
    conditions: {
      minIncome: 1800,
      minSeniority: 18,
      maxDebtRatio: 33,
      requiredDocuments: ['Certificati di stipendio', 'Carta d\'identità']
    },
    advantages: ['Réseau européen', 'Stabilité financière', 'Offres sur mesure'],
    color: 'bg-gradient-to-r from-red-700 to-pink-800'
  },

  // ========== BANQUES NÉERLANDAISES ==========
  {
    id: 'ing',
    name: 'ING Bank',
    logo: '/banks/ing.png',
    description: 'Banque internationale, leader digital',
    acceptanceRate: 74,
    interestRate: { min: 6.3, max: 8.5 },
    maxAmount: 85000,
    maxDuration: 84,
    conditions: {
      minIncome: 2100,
      minSeniority: 24,
      maxDebtRatio: 30,
      requiredDocuments: ['Loonstroken', 'Werkgeversverklaring', 'ID-bewijs']
    },
    advantages: ['Banque 100% digitale', 'Taux compétitifs', 'Service réactif'],
    color: 'bg-gradient-to-r from-orange-600 to-amber-700'
  },
  {
    id: 'abn-amro',
    name: 'ABN AMRO',
    logo: '/banks/abn-amro.png',
    description: 'Banque néerlandaise historique et fiable',
    acceptanceRate: 71,
    interestRate: { min: 6.7, max: 9.0 },
    maxAmount: 75000,
    maxDuration: 84,
    conditions: {
      minIncome: 1950,
      minSeniority: 18,
      maxDebtRatio: 32,
      requiredDocuments: ['Salarisstroken', 'Arbeidscontract']
    },
    advantages: ['Banque traditionnelle', 'Conseil expert', 'Stabilité reconnue'],
    color: 'bg-gradient-to-r from-green-700 to-emerald-800'
  }
];


// Système de scoring
// Système de scoring corrigé
export const calculateScore = (responses: Record<string, any>): number => {
  let score = 50; // Score de base
  
  // 1. Revenus (max +30 points) - INCLUANT revenus du conjoint
  const income = Number(
    responses['vehicule-11'] ||  // Revenus pour véhicule
    responses['travaux-11'] ||   // Revenus travaux
    responses['equipement-9'] || // Revenus équipement
    responses['argent-9'] ||     // Revenus pour argent
    0
  );
  
  // Ajouter les revenus du conjoint si disponibles
  const spouseIncome = Number(
    responses['vehicule-6c'] ||
    responses['travaux-7c'] ||
    responses['equipement-5c'] ||
    responses['argent-5c'] ||
    0
  );
  
  const totalIncome = income + spouseIncome;
  
  // Score basé sur les revenus totaux (incluant conjoint)
  if (totalIncome >= 3000) score += 30;
  else if (totalIncome >= 2000) score += 20;
  else if (totalIncome >= 1500) score += 10;
  else if (totalIncome < 1000) score -= 10;
  
  // 2. Ancienneté emploi (max +20 points)
  const seniority = responses['vehicule-10'] || responses['travaux-10'] || responses['argent-8'] || '';
  
  // 3. Type de contrat (max +15 points)
  const contract = responses['vehicule-9'] || responses['travaux-11'] || responses['equipement-7'] || responses['argent-8'] || '';
  
  // 4. Situation familiale (max +10 points)
  const family = responses['vehicule-6'] || responses['travaux-9'] || responses['equipement-5'] || responses['argent-5'] || '';
  
  // 5. Personnes à charge (max -15 points)
  const dependents = Number(responses['vehicule-7'] || responses['travaux-10'] || responses['equipement-6'] || responses['argent-6'] || 0);
  
  // 6. Crédits en cours (max -25 points)
  const hasLoans = responses['vehicule-12'] || responses['travaux-12'] || responses['equipement-10'] || responses['argent-11'] || 'Non';
  if (hasLoans === 'Oui') {
    // CORRECTION : Utiliser les bonnes références pour les montants de crédit
    const loanAmount = Number(
      responses['vehicule-13'] || 
      responses['travaux-13'] || 
      responses['equipement-11'] || 
      responses['argent-12'] || 
      0
    );
    if (loanAmount > 500) score -= 25;
    else if (loanAmount > 200) score -= 15;
    else score -= 10;
  } else {
    score += 15; // Bonus si pas de crédit
  }
  
  // 7. Propriété du logement (max +20 points) - IMPORTANT pour la banque
  let ownershipStatus = '';
  if (responses['vehicule-8']) ownershipStatus = responses['vehicule-8'];
  else if (responses['travaux-3']) ownershipStatus = responses['travaux-3'];
  else if (responses['equipement-3']) ownershipStatus = responses['equipement-3'];
  else if (responses['argent-3']) ownershipStatus = responses['argent-3'];
  
  if (ownershipStatus.includes('sans crédit')) {
    score += 20; // Propriétaire sans crédit = sécurité maximale
  } else if (ownershipStatus.includes('avec crédit')) {
    score += 10; // Propriétaire avec crédit = sécurité moyenne
  }
  // Locataire = 0 points (neutre)
  
  // 8. Refus précédent (max -30 points)
  const previousRefusal = responses['vehicule-14'] || 'Non';
  if (previousRefusal === 'Oui') score -= 30;
  
  // 9. Ancienneté professionnelle (max +10 points) - Stabilité
  let seniorityLevel = '';
  if (responses['vehicule-10']) seniorityLevel = responses['vehicule-10'];
  else if (responses['travaux-10']) seniorityLevel = responses['travaux-10'];
  else if (responses['equipement-8']) seniorityLevel = responses['equipement-8'];
  else if (responses['argent-8']) seniorityLevel = responses['argent-8'];
  
  if (seniorityLevel.includes('Plus de 5 ans')) score += 10;
  else if (seniorityLevel.includes('2 à 5 ans')) score += 7;
  else if (seniorityLevel.includes('1 à 2 ans')) score += 5;
  else if (seniorityLevel.includes('6 mois à 1 an')) score += 2;
  
  // 10. Type de travaux ou équipement
  const projectType = responses['travaux-1'] || responses['equipement-1'] || '';
  if (projectType) {
    // Les travaux d'amélioration énergétique sont favorisés
    if (projectType === 'Isolation thermique') score += 5;
    else if (projectType === 'Rénovation complète' || projectType === 'Toiture') score += 3;
  }
  
  // Limiter le score entre 0 et 100
  return Math.min(Math.max(score, 0), 100);
};

// Calculer les résultats par banque
export const calculateBankResults = (
  responses: Record<string, any>, 
  requestedAmount: number, 
  duration: string
): ScoringResult[] => {
  const score = calculateScore(responses);
  const results: ScoringResult[] = [];
  
  // Convertir la durée en mois
  const durationMonths = parseInt(duration) || 60;
  
  banks.forEach(bank => {
    // Vérification des critères
    let accepted = score >= bank.acceptanceRate;
    let reason = '';
    const conditions: string[] = [];
    
    // Vérification du montant
    if (requestedAmount > bank.maxAmount) {
      accepted = false;
      reason = `Montant trop élevé (max: ${bank.maxAmount}€)`;
    }
    
    // Vérification de la durée
    if (durationMonths > bank.maxDuration) {
      accepted = false;
      reason = `Durée trop longue (max: ${bank.maxDuration} mois)`;
    }
    
    // Vérification des revenus minimum (adaptée au montant du crédit)
    if (bank.conditions.minIncome) {
      const income = Number(
        responses['vehicule-11'] ||  // Revenus véhicule
        responses['travaux-11'] ||   // Revenus travaux
        responses['equipement-9'] || // Revenus équipement
        responses['argent-9'] ||     // Revenus argent
        0
      );
      
      // Ajouter revenus du conjoint
      const spouseIncome = Number(
        responses['vehicule-6c'] ||
        responses['travaux-7c'] ||
        responses['equipement-5c'] ||
        responses['argent-5c'] ||
        0
      );
      
      const totalIncome = income + spouseIncome;
      
      // Ajuster le revenu minimum en fonction du montant demandé
      // Pour les petits montants (<10k€), on réduit l'exigence de revenus
      let adjustedMinIncome = bank.conditions.minIncome;
      if (requestedAmount < 10000) {
        // Réduction proportionnelle : 10k€ = 100%, 5k€ = 70%, 3k€ = 50%
        const ratio = Math.max(0.5, requestedAmount / 10000);
        adjustedMinIncome = Math.round(bank.conditions.minIncome * ratio);
      }
      
      if (totalIncome < adjustedMinIncome) {
        accepted = false;
        reason = `Revenus insuffisants (min: ${adjustedMinIncome}€ pour ce montant)`;
        conditions.push(`Revenus minimum: ${adjustedMinIncome}€`);
      }
    }
    
    // Calcul du taux estimé basé sur le score
    const rateRange = bank.interestRate.max - bank.interestRate.min;
    const ratePercentage = (100 - score) / 100; // Meilleur score = meilleur taux
    const estimatedRate = parseFloat((bank.interestRate.min + (rateRange * ratePercentage)).toFixed(2));
    
    // Calcul de la mensualité (formule simplifiée)
    const monthlyRate = estimatedRate / 100 / 12;
    const monthlyPayment = requestedAmount > 0 && durationMonths > 0
      ? parseFloat((requestedAmount * monthlyRate * Math.pow(1 + monthlyRate, durationMonths) / 
                   (Math.pow(1 + monthlyRate, durationMonths) - 1)).toFixed(2))
      : 0;
    
    // Si accepté, on ajuste la raison
    if (accepted) {
      if (score >= 90) reason = 'Excellente admissibilité';
      else if (score >= 80) reason = 'Très bonne admissibilité';
      else if (score >= 70) reason = 'Bonne admissibilité';
      else reason = 'Admissibilité limite';
    }
    
    results.push({
      bank,
      score,
      accepted,
      reason,
      estimatedRate,
      monthlyPayment,
      conditions: bank.conditions.requiredDocuments
    });
  });
  
  // Trier par taux d'intérêt (meilleur taux d'abord)
  return results.sort((a, b) => {
    if (a.accepted && !b.accepted) return -1;
    if (!a.accepted && b.accepted) return 1;
    return a.estimatedRate - b.estimatedRate;
  });
};

// Calcul du ratio d'endettement
export const calculateDebtRatio = (responses: Record<string, any>): number => {
  // Récupérer les revenus selon le type de crédit
  const income = Number(
    responses['vehicule-11'] ||  // Revenus véhicule
    responses['travaux-11'] ||   // Revenus travaux
    responses['equipement-9'] || // Revenus équipement
    responses['argent-9'] ||     // Revenus argent
    1
  );
  
  // Ajouter revenus du conjoint
  const spouseIncome = Number(
    responses['vehicule-6c'] ||
    responses['travaux-7c'] ||
    responses['equipement-5c'] ||
    responses['argent-5c'] ||
    0
  );
  
  const totalIncome = income + spouseIncome;
  
  // Récupérer les mensualités de crédits en cours
  const existingLoans = Number(
    responses['vehicule-13'] ||   // Crédits véhicule
    responses['travaux-13'] ||    // Crédits travaux
    responses['equipement-11'] || // Crédits équipement
    responses['argent-12'] ||     // Crédits argent
    0
  );
  
  // Ajouter les crédits immobiliers si existants
  const mortgageLoans = Number(
    responses['vehicule-8c'] ||  // Crédit immo véhicule
    responses['travaux-13b'] ||  // Crédit immo travaux
    0
  );
  
  const totalLoans = existingLoans + mortgageLoans;
  
  if (totalIncome === 0) return 0;
  return parseFloat(((totalLoans / totalIncome) * 100).toFixed(1));
};