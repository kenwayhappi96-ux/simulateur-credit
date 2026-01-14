'use client';

import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { updateUserSimulations } from '@/store/store';
import { calculateBankResults, calculateScore, calculateDebtRatio } from '@/utils/banks';
import { calculateLoan, getBankRate } from '@/utils/loanCalculations';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Star, TrendingUp, Percent, AlertCircle, ThumbsUp, FileText } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { vehiculeQuestions, travauxQuestions, equipementQuestions, argentQuestions } from '@/utils/questions';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface ResultsProps {
  onRestart: () => void;
}

export default function Results({ onRestart }: ResultsProps) {
  const router = useRouter();
  const dispatch = useDispatch();
  const { responses, selectedOption } = useSelector((state: RootState) => state.form);
  const { user } = useSelector((state: RootState) => state.auth);
  const [results, setResults] = useState<any[]>([]);
  const [overallScore, setOverallScore] = useState(0);
  const [debtRatio, setDebtRatio] = useState(0);
  const [durationMonths, setDurationMonths] = useState(0);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const hasSaved = useRef(false); // Garde pour éviter double sauvegarde
  const saveInitiated = useRef(false); // Garde supplémentaire pour empêcher multiples appels

  useEffect(() => {
    // Extraire les informations importantes
    let requestedAmount = 0;
    let duration = '60 mois';
    let simulationType = '';
    
    // Selon l'option sélectionnée, prendre les bonnes réponses
    if (selectedOption === "J'achète un véhicule") {
      requestedAmount = Number(responses['vehicule-3'] || 0);
      duration = responses['vehicule-5'] || '60 mois';
      simulationType = 'vehicule';
    } else if (selectedOption === "Je fais des travaux") {
      requestedAmount = Number(responses['travaux-2'] || 0);
      duration = responses['travaux-6'] || '60 mois';
      simulationType = 'travaux';
    } else if (selectedOption === "Je m'équipe") {
      requestedAmount = Number(responses['equipement-2'] || 0);
      duration = responses['equipement-4'] || '48 mois';
      simulationType = 'equipement';
    } else if (selectedOption === "J'ai besoin d'argent") {
      requestedAmount = Number(responses['argent-1'] || 0);
      duration = responses['argent-4'] || '60 mois';
      simulationType = 'argent';
    }
    
    // Calculer les résultats
    const bankResults = calculateBankResults(responses, requestedAmount, duration);
    const score = calculateScore(responses);
    const ratio = calculateDebtRatio(responses);
    const durMois = parseInt(duration.replace(' mois', ''));
    
    setResults(bankResults);
    setOverallScore(score);
    setDebtRatio(ratio);
    setDurationMonths(durMois);

    // Sauvegarder la simulation automatiquement (une seule fois)
    // Utiliser 2 gardes : hasSaved pour l'état et saveInitiated pour bloquer l'appel même si re-render
    if (!hasSaved.current && !saveInitiated.current && user && requestedAmount > 0) {
      saveInitiated.current = true; // Bloquer immédiatement
      hasSaved.current = true;
      saveSimulation(requestedAmount, duration, simulationType);
    }
  }, [responses, selectedOption]); // Retirer 'user' des dépendances pour éviter double appel

  const saveSimulation = async (requestedAmount: number, duration: string, simulationType: string) => {
    if (!user) return;
    
    // Déterminer le type de simulation depuis selectedOption si simulationType est vide
    let finalSimulationType = simulationType;
    if (!finalSimulationType) {
      if (selectedOption === "J'achète un véhicule") finalSimulationType = 'vehicule';
      else if (selectedOption === "Je fais des travaux") finalSimulationType = 'travaux';
      else if (selectedOption === "Je m'équipe") finalSimulationType = 'equipement';
      else if (selectedOption === "J'ai besoin d'argent") finalSimulationType = 'argent';
      else finalSimulationType = 'vehicule'; // Par défaut
    }
    
    setSaving(true);
    try {
      // Extraire la durée en mois
      const dureeMois = parseInt(duration.replace(' mois', ''));
      
      // Trouver le meilleur taux parmi les banques qui acceptent
      const acceptedBanks = results.filter(r => r.accepted);
      let tauxBase = getBankRate(finalSimulationType, dureeMois);
      
      // Si des banques acceptent, utiliser le meilleur taux (le plus bas)
      if (acceptedBanks.length > 0) {
        tauxBase = Math.min(...acceptedBanks.map(b => b.estimatedRate));
      }
      
      const calculation = calculateLoan(requestedAmount, dureeMois, tauxBase, user);

      console.log('=== DÉBUT SAUVEGARDE SIMULATION ===');
      console.log('selectedOption:', selectedOption);
      console.log('simulationType (param):', simulationType);
      console.log('finalSimulationType:', finalSimulationType);
      console.log('requestedAmount:', requestedAmount);
      console.log('duration:', duration);
      console.log('dureeMois:', dureeMois);
      console.log('tauxBase:', tauxBase);
      console.log('calculation:', calculation);
      console.log('user:', user);
      
      const dataToSend = {
        simulation_type: finalSimulationType,
        montant_demande: calculation.montant_demande || requestedAmount,
        duree_mois: calculation.duree_mois || dureeMois,
        taux_applique: calculation.taux_applique || tauxBase,
        mensualite: calculation.mensualite || 0,
        cout_total: calculation.cout_total || 0,
        frais_ouverture: calculation.frais_ouverture || 0,
        responses: responses || {},
      };
      console.log('Données à envoyer à l\'API:', dataToSend);
      console.log('=================================');

      // Sauvegarder via l'API
      const response = await fetch('/api/simulations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend),
      });

      const data = await response.json();

      if (data.success) {
        setSaved(true);
        // Mettre à jour les infos utilisateur dans Redux
        if (data.user) {
          dispatch(updateUserSimulations({
            simulations_count: data.user.simulations_count,
            simulations_remaining: data.user.simulations_remaining,
          }));
        }
      } else {
        console.error('Erreur sauvegarde simulation:', data.message);
        alert('⚠️ Erreur lors de la sauvegarde: ' + data.message);
      }
    } catch (error) {
      console.error('Erreur sauvegarde simulation:', error);
      alert('⚠️ Erreur lors de la sauvegarde de la simulation');
    } finally {
      setSaving(false);
    }
  };

  // Compter les banques acceptées
  const acceptedBanks = results.filter(r => r.accepted).length;
  const rejectedBanks = results.filter(r => !r.accepted).length;

  // Fonction pour obtenir le texte réel de la question depuis les fichiers de questions
  const getQuestionLabel = (key: string): string => {
    // Créer un tableau avec toutes les questions
    const allQuestions = [
      ...vehiculeQuestions,
      ...travauxQuestions,
      ...equipementQuestions,
      ...argentQuestions
    ];
    
    // Trouver la question correspondante à l'ID
    const question = allQuestions.find(q => q.id === key);
    
    // Retourner le texte de la question ou l'ID si non trouvé
    return question ? question.text : key;
  };

  // Fonction pour analyser les points faibles
  const getImprovementSuggestions = () => {
    const suggestions: Array<{ type: 'warning' | 'info' | 'success'; message: string }> = [];
    
    const income = Number(
      responses['vehicule-11'] || responses['travaux-11'] || 
      responses['equipement-9'] || responses['argent-9'] || 0
    );
    
    const hasLoans = responses['vehicule-12'] === 'Oui' || 
                     responses['travaux-12'] === 'Oui' || 
                     responses['equipement-10'] === 'Oui' || 
                     responses['argent-11'] === 'Oui';
    
    const loanAmount = Number(
      responses['vehicule-13'] || responses['travaux-13'] || 
      responses['equipement-11'] || responses['argent-12'] || 0
    );

    // Suggestions basées sur les réponses
    if (income < 1800) {
      suggestions.push({
        type: 'warning',
        message: `Vos revenus (${income}€) sont en dessous du seuil recommandé de 1800€. Augmenter vos revenus ou trouver un co-emprunteur améliorerait vos chances.`
      });
    } else if (income >= 2500) {
      suggestions.push({
        type: 'success',
        message: `Vos revenus (${income}€) sont excellents et constituent un atout majeur.`
      });
    }

    if (hasLoans === 'Oui' && loanAmount > 0) {
      const ratio = (loanAmount / income) * 100;
      if (ratio > 33) {
        suggestions.push({
          type: 'warning',
          message: `Votre taux d'endettement (${ratio.toFixed(1)}%) dépasse les 33% recommandés. Réduire vos crédits en cours améliorerait votre dossier.`
        });
      }
    } else if (hasLoans === 'Non') {
      suggestions.push({
        type: 'success',
        message: "Vous n'avez pas de crédit en cours, c'est un excellent point pour votre dossier."
      });
    }

    // Vérifier la propriété du logement (important pour la banque)
    const ownership = 
      responses['vehicule-8'] || responses['travaux-3'] || 
      responses['equipement-3'] || responses['argent-3'] || '';
    
    if (ownership.includes('sans crédit')) {
      suggestions.push({
        type: 'success',
        message: "Être propriétaire sans crédit immobilier est un excellent point pour votre dossier !"
      });
    } else if (ownership.includes('avec crédit')) {
      suggestions.push({
        type: 'info',
        message: "Être propriétaire avec un crédit immobilier est positif, mais vérifiez votre taux d'endettement global."
      });
    } else if (ownership.includes('locataire')) {
      suggestions.push({
        type: 'info',
        message: "En tant que locataire, assurez-vous d'avoir des revenus stables et un bon historique bancaire."
      });
    }

    const refus = responses['vehicule-14'];
    if (refus === 'Oui') {
      suggestions.push({
        type: 'warning',
        message: "Un refus de crédit antérieur impacte négativement votre score. Attendez quelques mois avant de refaire une demande."
      });
    }

    // Ancienneté professionnelle
    const seniority = 
      responses['vehicule-10'] || responses['travaux-10'] || 
      responses['equipement-8'] || responses['argent-8'] || '';
    
    if (seniority.includes('Plus de 5 ans') || seniority.includes('2 à 5 ans')) {
      suggestions.push({
        type: 'success',
        message: `Votre ancienneté professionnelle (${seniority}) est un atout majeur.`
      });
    } else if (seniority.includes('Moins de 6 mois')) {
      suggestions.push({
        type: 'warning',
        message: "Votre ancienneté professionnelle est faible. Les banques préfèrent généralement au moins 6 mois d'ancienneté."
      });
    }

    const emploi = responses['vehicule-9'] || responses['travaux-9'] || responses['equipement-7'] || responses['argent-7'];
    if (emploi === 'CDI' || emploi === 'Fonctionnaire') {
      suggestions.push({
        type: 'success',
        message: `Votre statut d'emploi (${emploi}) est très apprécié par les banques.`
      });
    } else if (emploi === 'CDD' || emploi === 'Intérim') {
      suggestions.push({
        type: 'info',
        message: `Votre type de contrat (${emploi}) peut limiter vos options. Un CDI améliorerait vos chances.`
      });
    }

    return suggestions;
  };

  const suggestions = getImprovementSuggestions();

  return (
    <div className="max-w-6xl mx-auto">
      {/* En-tête des résultats */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-green-50 to-emerald-100 mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-white" />
          </div>
        </div>
        
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
          Résultats de votre simulation
        </h1>
        
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Basé sur vos réponses, voici les offres les plus adaptées à votre profil
        </p>
      </motion.div>

      {/* Explication du fonctionnement */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6 mb-8"
      >
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              💡 Comment fonctionnent les taux affichés ?
            </h3>
            <div className="text-sm text-gray-700 space-y-2">
              <p>
                <strong>Les taux des banques</strong> (affichés ci-dessous) sont les taux réels estimés que chaque établissement vous proposerait directement. Ces taux varient selon votre profil (revenus, endettement, situation professionnelle).
              </p>
              <p>
                <strong>Le taux affiché dans le récapitulatif</strong> correspond au <span className="font-semibold text-blue-700">meilleur taux parmi les banques qui acceptent votre dossier</span>. C'est donc l'offre la plus avantageuse pour vous !
              </p>
              <p className="text-xs text-gray-600 italic">
                ⚡ Astuce : Les banques avec un score d'acceptation élevé et un faible taux sont vos meilleures opportunités.
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Score global et indicateurs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Score de solvabilité</h3>
              <p className="text-sm text-gray-500">Basé sur votre profil</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
              <Star className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900 mb-2">{overallScore}/100</div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className={`h-3 rounded-full ${
                  overallScore >= 70 ? 'bg-green-500' :
                  overallScore >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${overallScore}%` }}
              ></div>
            </div>
            <div className="mt-2">
              {overallScore >= 70 ? (
                <span className="text-green-600 font-medium">✅ Bon profil</span>
              ) : overallScore >= 50 ? (
                <span className="text-yellow-600 font-medium">⚠️ Profil moyen</span>
              ) : (
                <span className="text-red-600 font-medium">❌ Profil difficile</span>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Ratio d'endettement</h3>
              <p className="text-sm text-gray-500">Crédits en cours / Revenus</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center">
              <Percent className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900 mb-2">{debtRatio}%</div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className={`h-3 rounded-full ${
                  debtRatio <= 33 ? 'bg-green-500' :
                  debtRatio <= 45 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${Math.min(debtRatio, 100)}%` }}
              ></div>
            </div>
            <div className="mt-2">
              {debtRatio <= 33 ? '✅ Excellent' :
               debtRatio <= 45 ? '⚠️ Acceptable' : '❌ Trop élevé'}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Résultats banques</h3>
              <p className="text-sm text-gray-500">Analyse comparative</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Acceptées</span>
              <span className="text-2xl font-bold text-green-600">{acceptedBanks}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Refusées</span>
              <span className="text-2xl font-bold text-red-600">{rejectedBanks}</span>
            </div>
            <div className="text-center pt-4">
              <div className="text-lg font-semibold text-gray-800">
                {acceptedBanks > 0 
                  ? `${acceptedBanks} banque${acceptedBanks > 1 ? 's' : ''} susceptibles de vous accorder un crédit`
                  : 'Aucune banque ne semble accepter votre profil actuellement'
                }
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Récapitulatif de la meilleure offre */}
      {acceptedBanks > 0 && (() => {
        const bestBank = results.filter(r => r.accepted).sort((a, b) => a.estimatedRate - b.estimatedRate)[0];
        let requestedAmount = 0;
        let duration = '60 mois';
        
        if (selectedOption === "J'achète un véhicule") {
          requestedAmount = Number(responses['vehicule-3'] || 0);
          duration = responses['vehicule-5'] || '60 mois';
        } else if (selectedOption === "Je fais des travaux") {
          requestedAmount = Number(responses['travaux-2'] || 0);
          duration = responses['travaux-6'] || '60 mois';
        } else if (selectedOption === "Je m'équipe") {
          requestedAmount = Number(responses['equipement-2'] || 0);
          duration = responses['equipement-4'] || '48 mois';
        } else if (selectedOption === "J'ai besoin d'argent") {
          requestedAmount = Number(responses['argent-1'] || 0);
          duration = responses['argent-4'] || '60 mois';
        }
        
        const durationMonths = parseInt(duration.replace(' mois', ''));
        const monthlyRate = bestBank.estimatedRate / 100 / 12;
        const totalCost = bestBank.monthlyPayment ? bestBank.monthlyPayment * durationMonths : 0;
        
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl shadow-2xl p-8 mb-12 text-white"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">🎉 Meilleure offre trouvée !</h2>
                <p className="text-green-50">Voici le récapitulatif de votre meilleure option</p>
              </div>
              <div className="relative w-24 h-24">
                <Image
                  src={bestBank.bank.logo}
                  alt={bestBank.bank.name}
                  fill
                  className="object-contain"
                />
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <div className="text-green-100 text-sm mb-1">Banque</div>
                  <div className="text-2xl font-bold">{bestBank.bank.name}</div>
                </div>
                <div>
                  <div className="text-green-100 text-sm mb-1">Taux</div>
                  <div className="text-2xl font-bold">{bestBank.estimatedRate}%</div>
                </div>
                <div>
                  <div className="text-green-100 text-sm mb-1">Mensualité</div>
                  <div className="text-2xl font-bold">{bestBank.monthlyPayment?.toLocaleString('fr-FR')}€</div>
                </div>
                <div>
                  <div className="text-green-100 text-sm mb-1">Coût total</div>
                  <div className="text-2xl font-bold">{totalCost.toLocaleString('fr-FR')}€</div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="text-sm text-green-50">
                Pour un montant de <span className="font-bold">{requestedAmount.toLocaleString('fr-FR')}€</span> sur <span className="font-bold">{durationMonths} mois</span>
              </div>
              <div className="text-sm font-semibold">
                {bestBank.reason}
              </div>
            </div>
          </motion.div>
        );
      })()}

      {/* Message de contact WhatsApp et Email */}
      {acceptedBanks > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-2xl shadow-lg p-6 mb-12"
        >
          <div className="text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              📞 Besoin d'aide pour finaliser votre demande ?
            </h3>
            <p className="text-gray-700 mb-6">
              Contactez nos experts pour obtenir un accompagnement personnalisé et maximiser vos chances d'obtenir votre crédit
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {/* Bouton WhatsApp */}
              <a
                href="https://wa.me/33769587858"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                <span>Contacter sur WhatsApp</span>
              </a>

              {/* Bouton Email */}
              <a
                href="mailto:contact@simulateurcredit.fr"
                className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>Contacter par Email</span>
              </a>
            </div>

            <p className="text-sm text-gray-600 mt-4">
              ⚡ Réponse rapide garantie • 100% gratuit et sans engagement
            </p>
          </div>
        </motion.div>
      )}

      {/* Message d'alerte si aucune banque n'accepte */}
      {acceptedBanks === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl shadow-2xl p-8 mb-12 text-white"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
              <AlertCircle className="w-10 h-10" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2">❌ Aucune banque n'a accepté votre demande</h2>
              <p className="text-orange-50">Toutes les banques ont refusé votre dossier pour les raisons listées ci-dessous</p>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-6">
            <p className="text-lg mb-4">
              💡 <strong>Conseils pour améliorer votre dossier :</strong>
            </p>
            <ul className="space-y-2 text-orange-50">
              <li>• Augmentez vos revenus ou trouvez un co-emprunteur</li>
              <li>• Réduisez le montant demandé</li>
              <li>• Renforcez votre stabilité professionnelle</li>
              <li>• Allongez la durée du crédit pour réduire les mensualités</li>
              <li>• Attendez d'améliorer votre situation professionnelle</li>
            </ul>
          </div>

          {/* Bouton de contact WhatsApp */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
            <p className="text-lg font-semibold mb-4 text-center">
              🤝 Besoin d'aide ? Nos experts peuvent vous accompagner !
            </p>
            <p className="text-orange-50 mb-6 text-center">
              Contactez-nous sur WhatsApp pour trouver une solution adaptée à votre situation
            </p>
            <a
              href="https://wa.me/237690984805?text=Bonjour,%20aucune%20banque%20n'a%20accepté%20ma%20demande%20de%20crédit.%20J'aimerais%20obtenir%20de%20l'aide."
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-8 rounded-xl transition-all transform hover:scale-105 shadow-lg w-full"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              <span>Nous contacter sur WhatsApp</span>
            </a>
          </div>
        </motion.div>
      )}

      {/* Résumé de vos réponses et suggestions */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <FileText className="w-7 h-7 mr-3 text-blue-600" />
          Récapitulatif de votre profil
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Vos réponses */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <CheckCircle2 className="w-6 h-6 mr-2 text-blue-600" />
              Vos informations
            </h3>
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {Object.entries(responses)
                .filter(([key]) => !key.startsWith('main-'))
                .map(([key, value]) => (
                  <div key={key} className="flex justify-between items-start py-2 border-b border-gray-100 last:border-0">
                    <span className="text-sm font-medium text-gray-600 flex-1">
                      {getQuestionLabel(key)}
                    </span>
                    <span className="text-sm font-semibold text-gray-900 text-right ml-4">
                      {typeof value === 'number' && key.includes('vehicule-') && (key.includes('-3') || key.includes('-4') || key.includes('-11') || key.includes('-13'))
                        ? `${value.toLocaleString('fr-FR')} €`
                        : typeof value === 'number' && key.includes('travaux-') && (key.includes('-2') || key.includes('-5') || key.includes('-11') || key.includes('-13'))
                        ? `${value.toLocaleString('fr-FR')} €`
                        : value}
                    </span>
                  </div>
                ))}
            </div>
          </motion.div>

          {/* Suggestions d'amélioration */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <AlertCircle className="w-6 h-6 mr-2 text-orange-600" />
              Analyse et recommandations
            </h3>
            <div className="space-y-4">
              {suggestions.length > 0 ? (
                suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border-l-4 ${
                      suggestion.type === 'success'
                        ? 'bg-green-50 border-green-500'
                        : suggestion.type === 'warning'
                        ? 'bg-orange-50 border-orange-500'
                        : 'bg-blue-50 border-blue-500'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      {suggestion.type === 'success' ? (
                        <ThumbsUp className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      ) : suggestion.type === 'warning' ? (
                        <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                      ) : (
                        <Star className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      )}
                      <p className={`text-sm font-medium ${
                        suggestion.type === 'success'
                          ? 'text-green-800'
                          : suggestion.type === 'warning'
                          ? 'text-orange-800'
                          : 'text-blue-800'
                      }`}>
                        {suggestion.message}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Star className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p>Votre profil est équilibré. Continuez à maintenir une bonne gestion financière.</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Toutes les offres */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Toutes les offres disponibles</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map((result, index) => (
            <div
              key={result.bank.id}
              className={`bg-white rounded-2xl shadow-lg border-2 overflow-hidden ${
                result.accepted 
                  ? 'border-green-200 hover:border-green-300' 
                  : 'border-red-100 hover:border-red-200'
              }`}
            >
              <div className={`p-6 ${result.accepted ? 'bg-gradient-to-r from-gray-50 to-white' : 'bg-gradient-to-r from-gray-50 to-gray-100'}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-white p-1 shadow-sm">
                      <Image
                        src={result.bank.logo}
                        alt={result.bank.name}
                        fill
                        className="object-contain p-1"
                      />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">{result.bank.name}</h3>
                      <div className="flex items-center space-x-2">
                        {result.accepted ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                            <span className="text-sm text-green-600 font-medium">Admissible</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4 text-red-500" />
                            <span className="text-sm text-red-600 font-medium">Non admissible</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    result.accepted 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    Score: {result.score}/100
                  </div>
                </div>
                
                <p className="text-gray-600 text-sm mb-4">{result.bank.description}</p>
                
                <div className="space-y-3">
                  <div className="text-sm">
                    <div className="font-medium text-gray-700 mb-1">{result.reason}</div>
                    {result.accepted && (
                      <>
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-2">
                          <div className="text-green-700 font-bold text-base mb-1">
                            Taux estimé : {result.estimatedRate}%
                          </div>
                          {result.monthlyPayment && (
                            <>
                              <div className="text-sm text-gray-700">
                                Mensualité : <span className="font-semibold">{result.monthlyPayment.toLocaleString('fr-FR')}€</span>
                              </div>
                              <div className="text-sm text-gray-700 mt-1">
                                Coût total : <span className="font-semibold">{(result.monthlyPayment * durationMonths).toLocaleString('fr-FR')}€</span>
                              </div>
                            </>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                  
                  <button
                    className={`w-full py-2 rounded-lg font-medium transition-all ${
                      result.accepted
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800'
                        : 'bg-gray-100 text-gray-600 cursor-not-allowed'
                    }`}
                    disabled={!result.accepted}
                  >
                    {result.accepted ? 'Postuler maintenant' : 'Non éligible'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="text-center">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button
            onClick={() => router.push('/dashboard')}
            className="py-4 px-8 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all font-medium text-lg"
          >
            📊 Tableau de bord
          </button>
          
          <button
            onClick={onRestart}
            className="py-4 px-8 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium text-lg"
          >
            ← Nouvelle simulation
          </button>
          
          <button 
            className="py-4 px-8 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all font-medium text-lg"
            onClick={() => window.print()}
          >
            🖨️ Imprimer
          </button>
        </div>
        
        {saved && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-700 font-medium">
              ✅ Simulation enregistrée avec succès !
            </p>
            {user && user.subscription_plan === 'gratuit' && (
              <p className="text-sm text-green-600 mt-1">
                Il vous reste {user.simulations_remaining - 1}/3 simulations ce mois
              </p>
            )}
          </div>
        )}
        
        <p className="text-gray-500 text-sm mt-6">
          💡 Ces résultats sont indicatifs. Une demande officielle nécessitera l'étude complète de votre dossier.
        </p>
      </div>
    </div>
  );
}