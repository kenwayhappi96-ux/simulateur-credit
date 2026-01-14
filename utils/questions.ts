export interface Question {
  id: string;
  text: string;
  type: 'choice' | 'text' | 'number' | 'radio' | 'select';
  options?: string[];
  required?: boolean;
  placeholder?: string;
  min?: number;
  max?: number;
  condition?: (responses: Record<string, any>) => boolean;
  dependentQuestion?: string; // Question dont dépend cette question conditionnelle
}

export const mainQuestions: Question[] = [
  {
    id: 'main-1',
    text: "Quel est votre besoin en crédit consommation ?",
    type: 'choice',
    options: [
      "J'achète un véhicule",
      "Je fais des travaux",
      "Je m'équipe",
      "J'ai besoin d'argent"
    ],
    required: true,
  }
];

export const vehiculeQuestions: Question[] = [
  // Questions sur le véhicule lui-même
  {
    id: 'vehicule-1',
    text: "Pouvez-vous préciser votre projet ?",
    type: 'choice',
    options: [
      "Auto",
      "Moto",
      "Caravane / Mobil-Home",
      "Camping car"
    ],
    required: true,
  },
  {
    id: 'vehicule-2',
    text: "Type de véhicule recherché ?",
    type: 'select',
    options: ["Neuf", "Occasion (moins de 5 ans)", "Occasion (plus de 5 ans)"],
    required: true,
  },
  {
    id: 'vehicule-3',
    text: "Quel est le prix total du véhicule ?",
    type: 'number',
    placeholder: "Montant en €",
    min: 1000,
    max: 100000,
    required: true,
  },
  {
    id: 'vehicule-4',
    text: "Apport personnel disponible (ce que vous payez de votre poche) ?",
    type: 'number',
    placeholder: "Montant en €",
    min: 0,
    max: 100000,
    required: true,
  },
  {
    id: 'vehicule-5',
    text: "Durée souhaitée pour le crédit ?",
    type: 'select',
    options: ["12 mois", "24 mois", "36 mois", "48 mois", "60 mois", "72 mois", "84 mois"],
    required: true,
  },
  
  // Questions sur la situation personnelle
  {
    id: 'vehicule-6',
    text: "Quelle est votre situation familiale ?",
    type: 'radio',
    options: ["Célibataire", "Marié(e) / Pacsé(e)", "Concubinage", "Divorcé(e) / Séparé(e)", "Veuf / Veuve"],
    required: true,
  },
  {
    id: 'vehicule-6b',
    text: "Votre conjoint(e) travaille-t-il/elle ?",
    type: 'radio',
    options: ["Oui", "Non"],
    required: true,
    condition: (responses) => responses['vehicule-6'] === 'Marié(e) / Pacsé(e)' || responses['vehicule-6'] === 'Concubinage',
    dependentQuestion: 'vehicule-6'
  },
  {
    id: 'vehicule-6c',
    text: "Revenus mensuels de votre conjoint(e) ?",
    type: 'number',
    placeholder: "Montant en €",
    min: 0,
    required: false,
    condition: (responses) => responses['vehicule-6b'] === 'Oui',
    dependentQuestion: 'vehicule-6b'
  },
  {
    id: 'vehicule-7',
    text: "Nombre de personnes à charge ?",
    type: 'number',
    placeholder: "0, 1, 2, ...",
    min: 0,
    required: true,
  },
  {
    id: 'vehicule-8',
    text: "Êtes-vous propriétaire de votre logement ?",
    type: 'radio',
    options: ["Oui, sans crédit", "Oui, avec crédit immobilier", "Non, locataire", "Logé gratuitement"],
    required: true,
  },
  {
    id: 'vehicule-8b',
    text: "Montant de votre loyer mensuel ?",
    type: 'number',
    placeholder: "Montant en €",
    min: 0,
    max: 3000,
    required: true,
    condition: (responses) => responses['vehicule-8'] === 'Non, locataire',
    dependentQuestion: 'vehicule-8'
  },
  {
    id: 'vehicule-8c',
    text: "Montant de votre mensualité de crédit immobilier ?",
    type: 'number',
    placeholder: "Montant en €",
    min: 0,
    max: 5000,
    required: true,
    condition: (responses) => responses['vehicule-8'] === 'Oui, avec crédit immobilier',
    dependentQuestion: 'vehicule-8'
  },
  
  // Questions sur la situation professionnelle
  {
    id: 'vehicule-9',
    text: "Quelle est votre situation professionnelle ?",
    type: 'select',
    options: ["CDI", "CDD", "Intérim", "Fonctionnaire", "Profession libérale", "Auto-entrepreneur", "Retraité", "Sans emploi"],
    required: true,
  },
  {
    id: 'vehicule-10',
    text: "Ancienneté dans votre emploi actuel ?",
    type: 'select',
    options: ["Moins de 3 mois", "3 à 6 mois", "6 mois à 1 an", "1 à 2 ans", "2 à 5 ans", "Plus de 5 ans"],
    required: true,
    condition: (responses) => responses['vehicule-9'] !== 'Retraité' && responses['vehicule-9'] !== 'Sans emploi',
    dependentQuestion: 'vehicule-9'
  },
  {
    id: 'vehicule-10b',
    text: "Fin de votre contrat prévue ?",
    type: 'select',
    options: ["Dans moins de 3 mois", "Dans 3 à 6 mois", "Dans 6 à 12 mois", "Plus de 12 mois"],
    required: true,
    condition: (responses) => responses['vehicule-9'] === 'CDD' || responses['vehicule-9'] === 'Intérim',
    dependentQuestion: 'vehicule-9'
  },
  {
    id: 'vehicule-11',
    text: "Vos revenus mensuels nets (salaire/pension) ?",
    type: 'number',
    placeholder: "Montant en €",
    min: 800,
    required: true,
  },
  {
    id: 'vehicule-11b',
    text: "Avez-vous des revenus complémentaires réguliers ?",
    type: 'radio',
    options: ["Oui (location, prime, etc.)", "Non"],
    required: true,
  },
  {
    id: 'vehicule-11c',
    text: "Montant de ces revenus complémentaires mensuels ?",
    type: 'number',
    placeholder: "Montant en €",
    min: 0,
    required: false,
    condition: (responses) => responses['vehicule-11b'] === 'Oui (location, prime, etc.)',
    dependentQuestion: 'vehicule-11b'
  },
  
  // Questions sur les crédits et charges
  {
    id: 'vehicule-12',
    text: "Avez-vous des crédits en cours (hors immobilier) ?",
    type: 'radio',
    options: ["Oui", "Non"],
    required: true,
  },
  {
    id: 'vehicule-13',
    text: "Montant total de vos mensualités de crédit ?",
    type: 'number',
    placeholder: "Montant en €",
    min: 0,
    max: 3000,
    required: true,
    condition: (responses) => responses['vehicule-12'] === 'Oui',
    dependentQuestion: 'vehicule-12'
  },
  {
    id: 'vehicule-13b',
    text: "Type de crédits en cours ?",
    type: 'select',
    options: ["Crédit auto", "Crédit conso", "Crédit renouvelable", "Plusieurs crédits"],
    required: true,
    condition: (responses) => responses['vehicule-12'] === 'Oui',
    dependentQuestion: 'vehicule-12'
  },
  
  // Questions sur l'historique financier
  {
    id: 'vehicule-14',
    text: "Avez-vous déjà eu un incident bancaire (découvert, rejet de prélèvement) ?",
    type: 'radio',
    options: ["Non, jamais", "Oui, il y a plus d'un an", "Oui, récemment"],
    required: true,
  },
  {
    id: 'vehicule-15',
    text: "Avez-vous déjà été inscrit au FICP (fichier des incidents de paiement) ?",
    type: 'radio',
    options: ["Non", "Oui, mais c'est régularisé", "Oui, actuellement"],
    required: true,
  },
  {
    id: 'vehicule-16',
    text: "Avez-vous une assurance emprunteur actuelle ?",
    type: 'radio',
    options: ["Oui", "Non", "Je ne sais pas"],
    required: true,
  },
];

export const travauxQuestions: Question[] = [
  // Questions sur les travaux
  {
    id: 'travaux-1',
    text: "Type de travaux envisagés ?",
    type: 'choice',
    options: ["Rénovation complète", "Extension / Agrandissement", "Isolation thermique", "Toiture", "Cuisine / Salle de bain", "Autre"],
    required: true,
  },
  {
    id: 'travaux-2',
    text: "Montant que vous souhaitez emprunter ?",
    type: 'number',
    placeholder: "Montant en €",
    min: 1000,
    max: 100000,
    required: true,
  },
  {
    id: 'travaux-3',
    text: "Êtes-vous propriétaire de votre logement ?",
    type: 'radio',
    options: ["Oui, sans crédit immobilier", "Oui, avec crédit immobilier en cours", "Non, locataire"],
    required: true,
  },
  {
    id: 'travaux-4',
    text: "Les travaux concernent-ils votre résidence principale ?",
    type: 'radio',
    options: ["Oui", "Non, résidence secondaire", "Non, bien locatif"],
    required: true,
  },
  {
    id: 'travaux-5',
    text: "Avez-vous des devis pour ces travaux ?",
    type: 'radio',
    options: ["Oui, devis signés", "Oui, devis en cours", "Non, pas encore"],
    required: true,
  },
  {
    id: 'travaux-6',
    text: "Durée souhaitée pour le remboursement ?",
    type: 'select',
    options: ["12 mois", "24 mois", "36 mois", "48 mois", "60 mois", "72 mois", "84 mois", "96 mois"],
    required: true,
  },
  
  // Questions sur la situation personnelle
  {
    id: 'travaux-7',
    text: "Quelle est votre situation familiale ?",
    type: 'radio',
    options: ["Célibataire", "Marié(e) / Pacsé(e)", "Concubinage", "Divorcé(e) / Séparé(e)", "Veuf / Veuve"],
    required: true,
  },
  {
    id: 'travaux-7b',
    text: "Votre conjoint(e) travaille-t-il/elle ?",
    type: 'radio',
    options: ["Oui", "Non"],
    required: true,
    condition: (responses) => responses['travaux-7'] === 'Marié(e) / Pacsé(e)' || responses['travaux-7'] === 'Concubinage',
    dependentQuestion: 'travaux-7'
  },
  {
    id: 'travaux-7c',
    text: "Revenus mensuels de votre conjoint(e) ?",
    type: 'number',
    placeholder: "Montant en €",
    min: 0,
    required: false,
    condition: (responses) => responses['travaux-7b'] === 'Oui',
    dependentQuestion: 'travaux-7b'
  },
  {
    id: 'travaux-8',
    text: "Nombre de personnes à charge ?",
    type: 'number',
    placeholder: "0, 1, 2, ...",
    min: 0,
    required: true,
  },
  
  // Questions sur la situation professionnelle
  {
    id: 'travaux-9',
    text: "Quelle est votre situation professionnelle ?",
    type: 'select',
    options: ["CDI", "CDD", "Intérim", "Fonctionnaire", "Profession libérale", "Auto-entrepreneur", "Retraité", "Sans emploi"],
    required: true,
  },
  {
    id: 'travaux-10',
    text: "Depuis combien de temps occupez-vous cet emploi ?",
    type: 'select',
    options: ["Moins de 6 mois", "6 mois à 1 an", "1 à 2 ans", "2 à 5 ans", "Plus de 5 ans"],
    required: true,
    condition: (responses) => {
      const situation = responses['travaux-9'];
      return situation !== 'Retraité' && situation !== 'Sans emploi';
    },
    dependentQuestion: 'travaux-9'
  },
  {
    id: 'travaux-11',
    text: "Vos revenus mensuels nets (salaire/pension) ?",
    type: 'number',
    placeholder: "Montant en €",
    min: 800,
    required: true,
  },
  
  // Questions sur les crédits existants
  {
    id: 'travaux-12',
    text: "Avez-vous des crédits en cours (hors immobilier) ?",
    type: 'radio',
    options: ["Oui", "Non"],
    required: true,
  },
  {
    id: 'travaux-13',
    text: "Montant total de vos mensualités de crédit ?",
    type: 'number',
    placeholder: "Montant en €",
    min: 0,
    max: 3000,
    required: true,
    condition: (responses) => responses['travaux-12'] === 'Oui',
    dependentQuestion: 'travaux-12'
  },
];

export const equipementQuestions: Question[] = [
  // Questions sur l'équipement
  {
    id: 'equipement-1',
    text: "Type d'équipement souhaité ?",
    type: 'choice',
    options: ["Électroménager", "Informatique / High-tech", "Ameublement", "Autre équipement"],
    required: true,
  },
  {
    id: 'equipement-2',
    text: "Montant que vous souhaitez emprunter ?",
    type: 'number',
    placeholder: "Montant en €",
    min: 500,
    max: 200000,
    required: true,
  },
  {
    id: 'equipement-3',
    text: "Êtes-vous propriétaire de votre logement ?",
    type: 'radio',
    options: ["Oui, sans crédit immobilier", "Oui, avec crédit immobilier en cours", "Non, locataire"],
    required: true,
  },
  {
    id: 'equipement-4',
    text: "Durée souhaitée pour le remboursement ?",
    type: 'select',
    options: ["12 mois", "24 mois", "36 mois", "48 mois", "60 mois"],
    required: true,
  },
  
  // Questions sur la situation personnelle
  {
    id: 'equipement-5',
    text: "Quelle est votre situation familiale ?",
    type: 'radio',
    options: ["Célibataire", "Marié(e) / Pacsé(e)", "Concubinage", "Divorcé(e) / Séparé(e)", "Veuf / Veuve"],
    required: true,
  },
  {
    id: 'equipement-5b',
    text: "Votre conjoint(e) travaille-t-il/elle ?",
    type: 'radio',
    options: ["Oui", "Non"],
    required: true,
    condition: (responses) => responses['equipement-5'] === 'Marié(e) / Pacsé(e)' || responses['equipement-5'] === 'Concubinage',
    dependentQuestion: 'equipement-5'
  },
  {
    id: 'equipement-5c',
    text: "Revenus mensuels de votre conjoint(e) ?",
    type: 'number',
    placeholder: "Montant en €",
    min: 0,
    required: false,
    condition: (responses) => responses['equipement-5b'] === 'Oui',
    dependentQuestion: 'equipement-5b'
  },
  {
    id: 'equipement-6',
    text: "Nombre de personnes à charge ?",
    type: 'number',
    placeholder: "0, 1, 2, ...",
    min: 0,
    required: true,
  },
  
  // Questions sur la situation professionnelle
  {
    id: 'equipement-7',
    text: "Quelle est votre situation professionnelle ?",
    type: 'select',
    options: ["CDI", "CDD", "Intérim", "Fonctionnaire", "Profession libérale", "Auto-entrepreneur", "Retraité", "Sans emploi"],
    required: true,
  },
  {
    id: 'equipement-8',
    text: "Depuis combien de temps occupez-vous cet emploi ?",
    type: 'select',
    options: ["Moins de 6 mois", "6 mois à 1 an", "1 à 2 ans", "2 à 5 ans", "Plus de 5 ans"],
    required: true,
    condition: (responses) => {
      const situation = responses['equipement-7'];
      return situation !== 'Retraité' && situation !== 'Sans emploi';
    },
    dependentQuestion: 'equipement-7'
  },
  {
    id: 'equipement-9',
    text: "Vos revenus mensuels nets (salaire/pension) ?",
    type: 'number',
    placeholder: "Montant en €",
    min: 800,
    required: true,
  },
  
  // Questions sur les crédits existants
  {
    id: 'equipement-10',
    text: "Avez-vous des crédits en cours (hors immobilier) ?",
    type: 'radio',
    options: ["Oui", "Non"],
    required: true,
  },
  {
    id: 'equipement-11',
    text: "Montant total de vos mensualités de crédit ?",
    type: 'number',
    placeholder: "Montant en €",
    min: 0,
    max: 3000,
    required: true,
    condition: (responses) => responses['equipement-10'] === 'Oui',
    dependentQuestion: 'equipement-10'
  },
];

export const argentQuestions: Question[] = [
  // Question sur le montant
  {
    id: 'argent-1',
    text: "Montant que vous souhaitez emprunter ?",
    type: 'number',
    placeholder: "Montant en €",
    min: 500,
    max: 75000,
    required: true,
  },
  {
    id: 'argent-2',
    text: "Raison principale du prêt ?",
    type: 'choice',
    options: [
      "Financer un projet personnel",
      "Faire face à des imprévus",
      "Regrouper des crédits",
      "Autre"
    ],
    required: true,
  },
  {
    id: 'argent-3',
    text: "Êtes-vous propriétaire de votre logement ?",
    type: 'radio',
    options: ["Oui, sans crédit immobilier", "Oui, avec crédit immobilier en cours", "Non, locataire"],
    required: true,
  },
  {
    id: 'argent-4',
    text: "Durée souhaitée pour le remboursement ?",
    type: 'select',
    options: ["12 mois", "24 mois", "36 mois", "48 mois", "60 mois", "72 mois", "84 mois"],
    required: true,
  },
  
  // Questions sur la situation personnelle
  {
    id: 'argent-5',
    text: "Quelle est votre situation familiale ?",
    type: 'radio',
    options: ["Célibataire", "Marié(e) / Pacsé(e)", "Concubinage", "Divorcé(e) / Séparé(e)", "Veuf / Veuve"],
    required: true,
  },
  {
    id: 'argent-5b',
    text: "Votre conjoint(e) travaille-t-il/elle ?",
    type: 'radio',
    options: ["Oui", "Non"],
    required: true,
    condition: (responses) => responses['argent-5'] === 'Marié(e) / Pacsé(e)' || responses['argent-5'] === 'Concubinage',
    dependentQuestion: 'argent-5'
  },
  {
    id: 'argent-5c',
    text: "Revenus mensuels de votre conjoint(e) ?",
    type: 'number',
    placeholder: "Montant en €",
    min: 0,
    required: false,
    condition: (responses) => responses['argent-5b'] === 'Oui',
    dependentQuestion: 'argent-5b'
  },
  {
    id: 'argent-6',
    text: "Nombre de personnes à charge ?",
    type: 'number',
    placeholder: "0, 1, 2, ...",
    min: 0,
    required: true,
  },
  
  // Questions sur la situation professionnelle
  {
    id: 'argent-7',
    text: "Quelle est votre situation professionnelle ?",
    type: 'select',
    options: ["CDI", "CDD", "Intérim", "Fonctionnaire", "Profession libérale", "Auto-entrepreneur", "Retraité", "Sans emploi"],
    required: true,
  },
  {
    id: 'argent-8',
    text: "Depuis combien de temps occupez-vous cet emploi ?",
    type: 'select',
    options: ["Moins de 6 mois", "6 mois à 1 an", "1 à 2 ans", "2 à 5 ans", "Plus de 5 ans"],
    required: true,
    condition: (responses) => {
      const situation = responses['argent-7'];
      return situation !== 'Retraité' && situation !== 'Sans emploi';
    },
    dependentQuestion: 'argent-7'
  },
  {
    id: 'argent-9',
    text: "Vos revenus mensuels nets (salaire/pension) ?",
    type: 'number',
    placeholder: "Montant en €",
    min: 800,
    required: true,
  },
  
  // Questions sur les crédits existants
  {
    id: 'argent-11',
    text: "Avez-vous des crédits en cours ?",
    type: 'radio',
    options: ["Oui", "Non"],
    required: true,
  },
  {
    id: 'argent-12',
    text: "Montant total de vos mensualités de crédit ?",
    type: 'number',
    placeholder: "Montant en €",
    min: 0,
    max: 5000,
    required: true,
    condition: (responses) => responses['argent-11'] === 'Oui',
    dependentQuestion: 'argent-11'
  },
  {
    id: 'argent-13',
    text: "Avez-vous déjà eu des incidents de paiement ?",
    type: 'radio',
    options: ["Non, jamais", "Oui, mais régularisé", "Oui, actuellement"],
    required: true,
  },
];

// Fonction pour obtenir les questions filtrées selon les conditions
export const getQuestionsByPath = (path: string[], responses: Record<string, any> = {}): Question[] => {
  let questions: Question[] = [];
  
  // Déterminer le chemin
  if (path.length === 1 && path[0] === 'main') {
    questions = mainQuestions;
  } else if (path.includes("J'achète un véhicule") || path.includes('vehicule')) {
    questions = vehiculeQuestions;
  } else if (path.includes("Je fais des travaux") || path.includes('travaux')) {
    questions = travauxQuestions;
  } else if (path.includes("Je m'équipe") || path.includes('equipement')) {
    questions = equipementQuestions;
  } else if (path.includes("J'ai besoin d'argent") || path.includes('argent')) {
    questions = argentQuestions;
  } else {
    questions = mainQuestions;
  }
  
  // Filtrer les questions selon leurs conditions
  const filteredQuestions: Question[] = [];
  
  for (const question of questions) {
    // Si la question n'a pas de condition, l'ajouter
    if (!question.condition) {
      filteredQuestions.push(question);
    } 
    // Si la question a une condition, vérifier si elle est remplie
    else if (question.condition(responses)) {
      filteredQuestions.push(question);
    }
    // Si la question a une question dépendante et qu'elle n'est pas remplie, on peut sauter
    else if (question.dependentQuestion && !responses[question.dependentQuestion]) {
      // Ne pas ajouter la question conditionnelle
      continue;
    }
  }
  
  return filteredQuestions;
};

// Fonction pour calculer le nombre total de questions sans conditions
export const getTotalQuestionsWithoutConditions = (path: string[]): number => {
  if (path.includes("J'achète un véhicule") || path.includes('vehicule')) {
    return vehiculeQuestions.filter(q => !q.condition).length;
  } else if (path.includes("Je fais des travaux") || path.includes('travaux')) {
    return travauxQuestions.filter(q => !q.condition).length;
  } else if (path.includes("Je m'équipe") || path.includes('equipement')) {
    return equipementQuestions.filter(q => !q.condition).length;
  } else if (path.includes("J'ai besoin d'argent") || path.includes('argent')) {
    return argentQuestions.filter(q => !q.condition).length;
  }
  return mainQuestions.length;
};

// Fonction pour obtenir la prochaine question en tenant compte des conditions
export const getNextQuestionIndex = (
  currentIndex: number,
  questions: Question[],
  responses: Record<string, any>
): number => {
  // Si on est déjà à la dernière question, retourner -1
  if (currentIndex >= questions.length - 1) {
    return -1;
  }
  
  // Chercher la prochaine question qui doit être affichée
  let nextIndex = currentIndex + 1;
  
  while (nextIndex < questions.length) {
    const nextQuestion = questions[nextIndex];
    
    // Si la question n'a pas de condition, l'afficher
    if (!nextQuestion.condition) {
      return nextIndex;
    }
    
    // Si la question a une condition et qu'elle est remplie, l'afficher
    if (nextQuestion.condition(responses)) {
      return nextIndex;
    }
    
    // Sinon, passer à la question suivante
    nextIndex++;
  }
  
  // Si aucune question n'est trouvée, retourner -1
  return -1;
};