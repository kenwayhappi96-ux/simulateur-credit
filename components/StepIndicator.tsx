'use client';

import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Car, 
  Home, 
  ShoppingBag, 
  Wallet,
  ChevronRight,
  CheckCircle2
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { getQuestionsByPath } from '@/utils/questions';

// Mapping des icônes pour chaque option
const optionIcons: Record<string, React.ReactNode> = {
  "J'achète un véhicule": <Car className="w-5 h-5" />,
  "Je fais des travaux": <Home className="w-5 h-5" />,
  "Je m'équipe": <ShoppingBag className="w-5 h-5" />,
  "J'ai besoin d'argent": <Wallet className="w-5 h-5" />,
};

// Couleurs pour chaque option
const optionColors: Record<string, string> = {
  "J'achète un véhicule": "bg-gradient-to-r from-blue-500 to-cyan-500",
  "Je fais des travaux": "bg-gradient-to-r from-emerald-500 to-teal-500",
  "Je m'équipe": "bg-gradient-to-r from-violet-500 to-purple-500",
  "J'ai besoin d'argent": "bg-gradient-to-r from-amber-500 to-orange-500",
};

// Noms de chemins conviviaux
const pathNames: Record<string, string> = {
  'Auto': 'Achat auto',
  'Moto': 'Achat moto',
  'Caravane / Mobil-Home': 'Caravane/Mobil-home',
  'Camping car': 'Camping-car',
  'Rénovation': 'Travaux rénovation',
  'Extension': 'Travaux extension',
  'Isolation': 'Travaux isolation',
  'Toiture': 'Travaux toiture',
  'Plomberie': 'Travaux plomberie',
  'Électricité': 'Travaux électricité',
  'Électroménager': 'Équipement électroménager',
  'High-tech': 'Équipement high-tech',
  'Mobilier': 'Équipement mobilier',
  'Outillage': 'Équipement outillage',
  'Matériel professionnel': 'Équipement pro',
};

interface StepIndicatorProps {
  questionIndex?: number;
  totalQuestions?: number;
}

export default function StepIndicator({ questionIndex, totalQuestions }: StepIndicatorProps = {}) {
  const { currentStep, selectedOption, currentPath, progress, responses } = useSelector((state: RootState) => state.form);
  const [isVisible, setIsVisible] = useState(true);

  // Animation d'entrée/sortie
  useEffect(() => {
    setIsVisible(false);
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, [currentStep, selectedOption]);

  // Utiliser les props si disponibles, sinon calculer
  const getCurrentQuestion = () => questionIndex !== undefined ? questionIndex + 1 : currentStep;
  const getTotalQuestions = () => totalQuestions || 15;

  if (currentStep === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-10 text-center"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-50 to-blue-100 mb-6">
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 flex items-center justify-center">
            <Wallet className="w-6 h-6 text-white" />
          </div>
        </div>
        
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
          Simulateur de crédit consommation
          <span className="block text-2xl md:text-3xl text-blue-600 font-semibold mt-2">
            Obtenez votre estimation personnalisée
          </span>
        </h1>
        
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Répondez aux questions pour découvrir les offres adaptées à votre profil
        </p>
        
        <div className="mt-8 flex items-center justify-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
          <div className="text-sm text-gray-500 font-medium">
            Sans engagement • Gratuit • Confidentialité garantie
          </div>
        </div>
      </motion.div>
    );
  }

  const getStepTitle = () => {
    if (selectedOption) {
      return `Votre projet : ${selectedOption}`;
    }
    return "Simulation en cours";
  };

  const getFriendlyPathName = (path: string) => {
    return pathNames[path] || path;
  };

  // Rendu du chemin de navigation
  const renderBreadcrumb = () => {
    if (currentPath.length <= 2) return null;

    return (
      <div className="flex items-center space-x-1 text-sm text-gray-500 mb-4">
        <span className="text-blue-600 font-medium">Accueil</span>
        <ChevronRight className="w-4 h-4" />
        <span className="font-medium">{selectedOption}</span>
        {currentPath.slice(2).map((path, index) => (
          <div key={index} className="flex items-center">
            <ChevronRight className="w-4 h-4 mx-1" />
            <span className={`${index === currentPath.length - 3 ? 'text-gray-700 font-semibold' : 'text-gray-500'}`}>
              {getFriendlyPathName(path)}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="mb-10"
        >
          {/* Barre de progression horizontale */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${optionColors[selectedOption || ''] || 'bg-blue-500'}`}>
                  {selectedOption && optionIcons[selectedOption] ? (
                    <div className="text-white">{optionIcons[selectedOption]}</div>
                  ) : (
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  )}
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Progression</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-xl font-bold text-gray-900">{Math.round(progress)}%</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Barre de progression */}
            <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className={`absolute top-0 left-0 h-full rounded-full ${optionColors[selectedOption || ''] || 'bg-gradient-to-r from-blue-500 to-blue-600'}`}
              />
              {/* Marqueurs d'étapes */}
              <div className="absolute inset-0 flex justify-between px-1">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-1 h-2 rounded-full ${progress >= (i + 1) * 20 ? 'bg-white' : 'bg-transparent'}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* En-tête principal */}
          <div className="bg-gradient-to-r from-gray-50 to-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            {renderBreadcrumb()}
            
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <div className={`p-2 rounded-lg ${optionColors[selectedOption || ''] || 'bg-blue-500'} bg-opacity-10`}>
                    {selectedOption && optionIcons[selectedOption] ? (
                      <div className={`${optionColors[selectedOption || ''] || 'text-blue-600'}`}>
                        {optionIcons[selectedOption]}
                      </div>
                    ) : (
                      <CheckCircle2 className="w-5 h-5 text-blue-600" />
                    )}
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {getStepTitle()}
                  </h2>
                </div>
                
                <p className="text-gray-600 ml-11">
                  {getCurrentQuestion() === 1 
                    ? "Commençons par préciser votre projet"
                    : `Question ${getCurrentQuestion()} sur ${getTotalQuestions()} - Continuez pour obtenir votre estimation`
                  }
                </p>
              </div>
              
              {/* Indicateur d'étape en badge */}
              <div className="hidden md:block">
                <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-3 border border-gray-200 shadow-sm">
                  <div className="text-center">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                      Étape
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      {getCurrentQuestion()}
                      <span className="text-lg text-gray-500">/{getTotalQuestions()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Détails du chemin actuel (mobile) */}
            {currentPath.length > 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-6 pt-6 border-t border-gray-100"
              >
                <div className="flex items-center space-x-2 text-sm">
                  <span className="font-medium text-gray-700">Chemin :</span>
                  <div className="flex items-center space-x-1 flex-wrap">
                    {currentPath.map((path, index) => (
                      <div key={index} className="flex items-center">
                        <span className={`px-2 py-1 rounded ${index === currentPath.length - 1 ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-600'}`}>
                          {index === 0 ? 'Accueil' : getFriendlyPathName(path)}
                        </span>
                        {index < currentPath.length - 1 && (
                          <ChevronRight className="w-3 h-3 text-gray-400 mx-1" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Indicateur visuel de progression (petites étapes) */}
            <div className="mt-6 flex items-center space-x-1">
              {[...Array(Math.min(getCurrentQuestion(), 10))].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className={`h-1 flex-1 rounded-full ${i < getCurrentQuestion() - 1 
                    ? optionColors[selectedOption || '']?.replace('bg-gradient-to-r', 'bg') || 'bg-blue-500' 
                    : i === getCurrentQuestion() - 1 
                      ? optionColors[selectedOption || '']?.replace('bg-gradient-to-r', 'bg') || 'bg-blue-500'
                      : 'bg-gray-200'
                  } ${i === getCurrentQuestion() - 1 ? 'h-2' : ''}`}
                />
              ))}
            </div>
          </div>

          {/* Message d'encouragement */}
          {getCurrentQuestion() > 1 && getCurrentQuestion() < getTotalQuestions() - 2 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 flex items-center justify-center"
            >
              <div className="text-sm text-gray-500 italic">
                {progress < 30 && "C'est un bon début ! Continuez..."}
                {progress >= 30 && progress < 60 && "Vous y êtes presque à mi-chemin !"}
                {progress >= 60 && progress < 80 && "Plus que quelques questions !"}
                {progress >= 80 && "Presque terminé !"}
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}