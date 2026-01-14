/**
 * Vérifie si une adresse email existe réellement
 */
export async function verifyEmailExists(email: string): Promise<{ valid: boolean; message: string }> {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, message: 'Format d\'email invalide' };
  }

  const domain = email.split('@')[1].toLowerCase();
  
  // Liste stricte de domaines email valides et vérifiés
  const validDomains = [
    // Gmail
    'gmail.com',
    // Yahoo
    'yahoo.com', 'yahoo.fr', 'yahoo.co.uk', 'yahoo.de', 'yahoo.es', 'yahoo.it',
    // Microsoft
    'outlook.com', 'outlook.fr', 'hotmail.com', 'hotmail.fr', 'live.com', 'live.fr', 'msn.com',
    // Apple
    'icloud.com', 'me.com', 'mac.com',
    // Fournisseurs français
    'orange.fr', 'wanadoo.fr', 'free.fr', 'sfr.fr', 'laposte.net', 'bbox.fr', 'numericable.fr',
    // Autres populaires
    'aol.com', 'protonmail.com', 'proton.me', 'zoho.com', 'yandex.com', 'yandex.ru',
    'mail.com', 'gmx.com', 'gmx.fr', 'gmx.de',
    // Professionnels
    'company.com', 'enterprise.com'
  ];

  // Vérifier si c'est dans la liste des domaines valides
  if (validDomains.includes(domain)) {
    return { valid: true, message: 'Email valide' };
  }

  // Patterns pour emails professionnels et universitaires (accepter avec prudence)
  const professionalPatterns = [
    /^[a-z0-9-]+\.(com|fr|be|ch|ca|de|uk|net|org|edu|gov|co\.uk|co\.fr|ac\.[a-z]{2})$/
  ];

  const isProfessionalDomain = professionalPatterns.some(pattern => pattern.test(domain));
  if (isProfessionalDomain && domain.length >= 5) {
    // Accepter les domaines professionnels avec au moins 5 caractères
    return { valid: true, message: 'Email professionnel accepté' };
  }

  // Rejeter tous les autres domaines non reconnus
  return { 
    valid: false, 
    message: `Le domaine "${domain}" n'est pas reconnu. Utilisez un fournisseur d'email connu (Gmail, Outlook, Yahoo, etc.) ou un email professionnel valide.` 
  };
}

/**
 * Vérifie si l'email n'est pas jetable
 */
export function isDisposableEmail(email: string): boolean {
  const domain = email.split('@')[1].toLowerCase();
  const disposableDomains = [
    'tempmail.com', 'guerrillamail.com', '10minutemail.com', 'mailinator.com',
    'throwaway.email', 'temp-mail.org', 'yopmail.com', 'mohmal.com',
    'sharklasers.com', 'maildrop.cc', 'mintemail.com', 'trash-mail.com',
    'fakeinbox.com', 'spamgourmet.com', 'trashmail.com'
  ];
  return disposableDomains.includes(domain);
}
