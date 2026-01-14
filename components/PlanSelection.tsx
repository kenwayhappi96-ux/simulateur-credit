'use client';

import { useState, useEffect } from 'react';
import { Check } from 'lucide-react';
import { SubscriptionPlan } from '@/types/database';

interface PlanSelectionProps {
  onPlanSelected: (plan: 'gratuit' | 'illimite') => void;
}

export default function PlanSelection({ onPlanSelected }: PlanSelectionProps) {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<'gratuit' | 'illimite'>('gratuit');

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await fetch('/api/plans');
      const data = await response.json();
      if (data.success) {
        setPlans(data.plans);
      }
    } catch (error) {
      console.error('Erreur chargement plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = (planName: 'gratuit' | 'illimite') => {
    setSelectedPlan(planName);
    onPlanSelected(planName);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  return (
    <div className="py-8 px-4">
      <div className="text-center mb-8">
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          Choisissez votre pack
        </h2>
        <p className="text-gray-300 text-base sm:text-lg">
          Sélectionnez le pack qui correspond à vos besoins
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 sm:gap-8 max-w-5xl mx-auto">
        {plans.map((plan) => {
          const isSelected = selectedPlan === plan.name;
          const isIllimite = plan.name === 'illimite';

          return (
            <div
              key={plan.id}
              className={`relative rounded-2xl p-6 sm:p-8 transition-all cursor-pointer backdrop-blur-xl ${
                isSelected
                  ? 'bg-gradient-to-br from-blue-600 to-cyan-600 text-white shadow-2xl shadow-blue-500/50 scale-105 border-2 border-blue-400'
                  : 'bg-white/10 text-white shadow-lg hover:shadow-xl hover:bg-white/15 border-2 border-white/20'
              } ${isIllimite ? 'ring-4 ring-yellow-500/50' : ''}`}
              onClick={() => handleSelectPlan(plan.name)}
            >
              {isIllimite && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg">
                    ⭐ RECOMMANDÉ
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-xl sm:text-2xl font-bold mb-2 text-white">
                  {plan.display_name}
                </h3>
                <div className="flex items-baseline justify-center gap-2">
                  <span className={`text-3xl sm:text-4xl font-bold ${isSelected ? 'text-white' : 'text-blue-300'}`}>
                    {plan.price === 0 ? 'Gratuit' : `${plan.price}€`}
                  </span>
                  {plan.price > 0 && (
                    <span className={`text-sm ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                      /mois
                    </span>
                  )}
                </div>
              </div>

              <div className={`text-sm mb-6 ${isSelected ? 'text-white' : 'text-gray-200'}`}>
                {plan.description}
              </div>

              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3">
                  <Check className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isSelected ? 'text-white' : 'text-green-400'}`} />
                  <span className={`text-sm sm:text-base ${isSelected ? 'text-white' : 'text-gray-100'}`}>
                    <strong>
                      {plan.simulations_per_month 
                        ? `${plan.simulations_per_month} simulations` 
                        : 'Simulations illimitées'}
                    </strong> par mois
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isSelected ? 'text-white' : 'text-green-400'}`} />
                  <span className={`text-sm sm:text-base ${isSelected ? 'text-white' : 'text-gray-100'}`}>
                    Montant maximum : <strong>{plan.max_loan_amount.toLocaleString('fr-FR')}€</strong>
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isSelected ? 'text-white' : 'text-green-400'}`} />
                  <span className={`text-sm sm:text-base ${isSelected ? 'text-white' : 'text-gray-100'}`}>
                    Frais d'ouverture : <strong>{plan.commission_rate}%</strong> (jusqu'à 75k€)
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isSelected ? 'text-white' : 'text-green-400'}`} />
                  <span className={`text-sm sm:text-base ${isSelected ? 'text-white' : 'text-gray-100'}`}>
                    Historique des simulations
                  </span>
                </li>
                {isIllimite && (
                  <>
                    <li className="flex items-start gap-3">
                      <Check className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isSelected ? 'text-white' : 'text-green-400'}`} />
                      <span className={`text-sm sm:text-base ${isSelected ? 'text-white' : 'text-gray-100'}`}>
                        Taux préférentiels
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isSelected ? 'text-white' : 'text-green-400'}`} />
                      <span className={`text-sm sm:text-base ${isSelected ? 'text-white' : 'text-gray-100'}`}>
                        Support prioritaire
                      </span>
                    </li>
                  </>
                )}
              </ul>

              <button
                className={`w-full py-3 px-6 rounded-xl font-bold text-base sm:text-lg transition-all ${
                  isSelected
                    ? 'bg-white text-blue-600 hover:bg-blue-50 shadow-lg'
                    : 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-cyan-700 shadow-lg shadow-blue-500/50'
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectPlan(plan.name);
                }}
              >
                {isSelected ? '✓ Pack sélectionné' : 'Choisir ce pack'}
              </button>
            </div>
          );
        })}
      </div>

      <div className="text-center mt-8 text-sm text-gray-300">
        <p>🔒 Paiement sécurisé • Sans engagement • Résiliable à tout moment</p>
        <p className="mt-2">💡 Vous pourrez changer de pack à tout moment depuis votre tableau de bord</p>
      </div>
    </div>
  );
}
