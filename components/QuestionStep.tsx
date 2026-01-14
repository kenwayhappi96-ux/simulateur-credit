'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { setResponse, nextStep, prevStep, setSelectedOption } from '@/store/store';
import { Question } from '@/utils/questions';

interface QuestionStepProps {
  question: Question;
  questionIndex: number;
  totalQuestions: number;
}

export default function QuestionStep({ question, questionIndex, totalQuestions }: QuestionStepProps) {
  const dispatch = useDispatch();
  const { responses, currentStep, selectedOption } = useSelector((state: RootState) => state.form);
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [value, setValue] = useState(responses[question.id] || '');
  const [error, setError] = useState('');

  // Obtenir le montant max selon le pack de l'utilisateur
  const getMaxAmount = () => {
    if (!user) return question.max || 75000;
    return user.max_loan_amount;
  };

  // CORRECTION : Réinitialiser la valeur quand la question change
  useEffect(() => {
    setValue(responses[question.id] || '');
    setError('');
  }, [question.id, responses]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (question.required && !value) {
      setError('Ce champ est obligatoire');
      return;
    }

    // Validation pour les nombres
    if (question.type === 'number' && value) {
      const numValue = Number(value);
      const maxAmount = getMaxAmount();
      const isMoneyField = question.placeholder?.includes('€');
      
      if (question.min !== undefined && numValue < question.min) {
        const errorMsg = isMoneyField 
          ? `Le montant minimum est de ${question.min.toLocaleString('fr-FR')}€`
          : `La valeur minimum est ${question.min}`;
        setError(errorMsg);
        return;
      }
      
      // Utiliser le max du pack UNIQUEMENT pour les questions de montant de crédit
      const isCreditAmountQuestion = question.id === 'vehicule-3' || question.id === 'travaux-2' || 
                                     question.id === 'equipement-2' || question.id === 'argent-1';
      
      if (isCreditAmountQuestion) {
        if (numValue > maxAmount) {
          setError(`Le montant maximum pour votre pack est de ${maxAmount.toLocaleString('fr-FR')}€`);
          return;
        }
        // Ne pas faire la validation standard du question.max pour les montants de crédit
      } else {
        // Validation standard du max pour les autres champs numériques
        if (question.max !== undefined && numValue > question.max) {
          const errorMsg = isMoneyField
            ? `Le montant maximum est de ${question.max.toLocaleString('fr-FR')}€`
            : `La valeur maximum est ${question.max}`;
          setError(errorMsg);
          return;
        }
      }
    }

    // Sauvegarder la réponse
    dispatch(setResponse({ question: question.id, value }));
    
    // CORRECTION : La logique pour setSelectedOption doit être dans main-1 seulement
    if (question.id === 'main-1') {
      dispatch(setSelectedOption(value));
    } else {
      // Pour les autres questions, juste passer à la suivante
      dispatch(nextStep());
    }
  };

  const handlePrevious = () => {
    dispatch(prevStep());
  };

  const handleOptionClick = (optionValue: string) => {
    setValue(optionValue);
    setError('');
    
    // Sauvegarder la réponse et avancer automatiquement
    dispatch(setResponse({ question: question.id, value: optionValue }));
    
    if (question.id === 'main-1') {
      dispatch(setSelectedOption(optionValue));
    } else {
      dispatch(nextStep());
    }
  };

  const handleRadioChange = (optionValue: string) => {
    setValue(optionValue);
    setError('');
    
    // Sauvegarder la réponse et avancer automatiquement
    dispatch(setResponse({ question: question.id, value: optionValue }));
    
    // Petit délai pour une meilleure UX
    setTimeout(() => {
      dispatch(nextStep());
    }, 300);
  };

  const handleSelectChange = (optionValue: string) => {
    if (!optionValue) return; // Ne pas avancer si aucune option sélectionnée
    
    setValue(optionValue);
    setError('');
    
    // Sauvegarder la réponse et avancer automatiquement
    dispatch(setResponse({ question: question.id, value: optionValue }));
    
    // Petit délai pour une meilleure UX
    setTimeout(() => {
      dispatch(nextStep());
    }, 300);
  };

  const renderInput = () => {
    switch (question.type) {
      case 'choice':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {question.options?.map((option, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleOptionClick(option)}
                className={`p-4 sm:p-6 rounded-xl border-2 transition-all duration-200 text-left ${
                  value === option
                    ? 'border-blue-600 bg-gradient-to-br from-blue-50 to-blue-100 text-blue-700 shadow-lg'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                }`}
              >
                <div className="font-medium">{option}</div>
                {value === option && (
                  <div className="mt-2 text-sm text-blue-600 flex items-center">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mr-2"></div>
                    Sélectionné
                  </div>
                )}
              </button>
            ))}
          </div>
        );

      case 'radio':
        return (
          <div className="space-y-2 sm:space-y-3">
            {question.options?.map((option, index) => (
              <label 
                key={index} 
                className={`flex items-center space-x-2 sm:space-x-3 p-3 sm:p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  value === option
                    ? 'border-blue-600 bg-gradient-to-r from-blue-50 to-blue-100 shadow-md'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                }`}
              >
                <input
                  type="radio"
                  name={question.id}
                  value={option}
                  checked={value === option}
                  onChange={(e) => handleRadioChange(e.target.value)}
                  className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 cursor-pointer flex-shrink-0"
                />
                <span className={`text-sm sm:text-base text-gray-700 font-medium flex-1 ${
                  value === option ? 'text-blue-700' : ''
                }`}>
                  {option}
                </span>
                {value === option && (
                  <div className="ml-auto flex-shrink-0">
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                  </div>
                )}
              </label>
            ))}
          </div>
        );

      case 'select':
        return (
          <div className="relative">
            <select
              value={value}
              onChange={(e) => handleSelectChange(e.target.value)}
              className="w-full p-3 sm:p-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm sm:text-base text-gray-700 font-medium cursor-pointer transition-all hover:border-blue-300 appearance-none"
            >
              <option value="">Sélectionnez une option</option>
              {question.options?.map((option, index) => (
                <option key={index} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-3 sm:px-4 pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        );

      case 'number':
        const maxAmount = getMaxAmount();
        // Questions de montant de crédit UNIQUEMENT (prix véhicule, montant travaux, montant équipement, montant argent)
        const isCreditAmountQuestion = question.id === 'vehicule-3' || question.id === 'travaux-2' || 
                                       question.id === 'equipement-2' || question.id === 'argent-1';
        const isApportQuestion = question.id === 'vehicule-4' || question.id === 'travaux-7' || question.id === 'equipement-3';
        const displayMax = isCreditAmountQuestion ? maxAmount : (question.max || maxAmount);
        
        // Récupérer le montant demandé pour afficher l'aide sur l'apport
        let requestedAmount = 0;
        if (isApportQuestion) {
          if (question.id === 'vehicule-4') {
            requestedAmount = Number(responses['vehicule-3'] || 0);
          } else if (question.id === 'travaux-7') {
            requestedAmount = Number(responses['travaux-2'] || 0);
          } else if (question.id === 'equipement-3') {
            requestedAmount = Number(responses['equipement-2'] || 0);
          }
        }
        
        return (
          <div className="relative">
            <input
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={question.placeholder}
              min={question.min}
              max={displayMax}
              className="w-full p-3 sm:p-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base text-gray-700 font-medium transition-all hover:border-blue-300"
            />
            {question.placeholder?.includes('€') && (
              <div className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 flex items-center space-x-2">
                <span className="text-gray-500 font-semibold text-base sm:text-lg">€</span>
              </div>
            )}
            {/* Message d'aide pour l'apport personnel */}
            {isApportQuestion && requestedAmount > 0 && (
              <div className="mt-2 p-2 sm:p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start space-x-2">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-xs sm:text-sm text-blue-800">
                    <p className="font-medium mb-1">💡 L'apport personnel ne peut pas dépasser le montant demandé ({requestedAmount.toLocaleString('fr-FR')}€)</p>
                    <p className="text-blue-700">
                      Montant à emprunter = {requestedAmount.toLocaleString('fr-FR')}€ - Votre apport
                    </p>
                  </div>
                </div>
              </div>
            )}
            {/* Afficher Min/Max seulement pour les montants en euros */}
            {question.placeholder?.includes('€') && !isApportQuestion && (question.min !== undefined || question.max !== undefined) && (
              <div className="mt-2 text-xs text-gray-500 flex items-center space-x-1">
                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-xs sm:text-sm">
                  {question.min !== undefined && `Min: ${question.min.toLocaleString('fr-FR')}€`}
                  {question.min !== undefined && displayMax !== undefined && ' - '}
                  {displayMax !== undefined && `Max: ${displayMax.toLocaleString('fr-FR')}€`}
                </span>
              </div>
            )}
            {/* Afficher info pack seulement pour les montants de crédit */}
            {user && isCreditAmountQuestion && (
              <div className="mt-1 text-xs sm:text-sm text-blue-600 font-medium">
                Pack {user.subscription_plan === 'illimite' ? 'Illimité' : 'Gratuit'}: jusqu'à {maxAmount.toLocaleString('fr-FR')}€
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-8 border border-gray-100">
        <div className="flex items-center justify-between mb-4 sm:mb-8">
          <div className="flex-1">
            <div className="flex items-start space-x-2 sm:space-x-3">
              <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-base sm:text-lg">{questionIndex + 1}</span>
              </div>
              <div className="flex-1">
                <h3 className="text-lg sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2 leading-tight">{question.text}</h3>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  {question.required ? (
                    <span className="text-xs sm:text-sm text-red-500 font-medium flex items-center">
                      <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      Obligatoire
                    </span>
                  ) : (
                    <span className="text-xs sm:text-sm text-gray-500 font-medium">(Optionnel)</span>
                  )}
                  <span className="text-xs sm:text-sm text-gray-400 hidden sm:inline">•</span>
                  <span className="text-xs sm:text-sm text-gray-500 font-medium">
                    Question {questionIndex + 1}/{totalQuestions}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {renderInput()}

        {error && (
          <div className="mt-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg shadow-sm">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Afficher le bouton "Suivant" uniquement pour les champs number */}
        {question.type === 'number' ? (
          <div className="flex flex-col sm:flex-row justify-between gap-3 mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={handlePrevious}
              className="flex items-center justify-center space-x-2 px-4 sm:px-6 py-3 border-2 border-gray-300 rounded-xl text-sm sm:text-base text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-400 transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Précédent</span>
            </button>
            
            <button
              type="submit"
              disabled={question.required && !value}
              className={`flex items-center justify-center space-x-2 px-6 sm:px-8 py-3 rounded-xl text-sm sm:text-base font-semibold transition-all ${
                question.required && !value
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl'
              }`}
            >
              <span>{questionIndex === totalQuestions - 1 ? 'Terminer' : 'Suivant'}</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        ) : (
          <div className="flex justify-start mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={handlePrevious}
              className="flex items-center justify-center space-x-2 px-4 sm:px-6 py-3 border-2 border-gray-300 rounded-xl text-sm sm:text-base text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-400 transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Précédent</span>
            </button>
          </div>
        )}

        {/* Indication pour les questions à sélection automatique */}
        {question.type !== 'number' && (
          <div className="mt-3 sm:mt-4 flex items-center justify-center">
            <div className="text-xs sm:text-sm text-gray-500 italic flex items-center space-x-2">
              <svg className="w-4 h-4 text-blue-500 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span className="hidden sm:inline">Sélectionnez une option pour avancer automatiquement</span>
              <span className="sm:hidden">Cliquez pour continuer</span>
            </div>
          </div>
        )}
      </div>
    </form>
  );
}