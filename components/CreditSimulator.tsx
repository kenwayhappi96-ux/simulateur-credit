'use client';

import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { getQuestionsByPath } from '@/utils/questions';
import StepIndicator from './StepIndicator';
import QuestionStep from './QuestionStep';
import Results from './Results';
import { resetForm, nextStep } from '@/store/store';
import { useEffect } from 'react';

export default function CreditSimulator() {
  const dispatch = useDispatch();
  const { currentStep, selectedOption, currentPath, responses } = useSelector((state: RootState) => state.form);
  
  const questions = getQuestionsByPath(currentPath, responses);
  const currentQuestion = questions[currentStep];
  
  // Si on est sur la page principale (pas de catégorie sélectionnée)
  const isMainPage = currentPath.length === 1 && currentPath[0] === 'main';
  
  // Vérifier si toutes les questions sont répondues
  const allAnswered = questions.every(q => 
    // Si la question est conditionnelle et que la condition n'est pas remplie, on l'ignore
    (q.condition && !q.condition(responses)) ||
    // Si la question n'est pas obligatoire et n'a pas de réponse, c'est OK
    (!q.required && (responses[q.id] === undefined || responses[q.id] === '')) ||
    // Sinon, vérifier si elle a une réponse
    (responses[q.id] !== undefined && responses[q.id] !== '')
  );
  
  const shouldShowResults = 
    // Pas sur la page principale
    !isMainPage &&
    // Et soit on a dépassé le nombre de questions
    (currentStep >= questions.length ||
    // Soit il n'y a plus de question courante
    !currentQuestion ||
    // Soit on a répondu à toutes les questions et on est sur la dernière
    (currentStep === questions.length - 1 && allAnswered));

  const handleRestart = () => {
    dispatch(resetForm());
  };

  if (shouldShowResults) {
    return <Results onRestart={handleRestart} />;
  }

  // Si la question courante est conditionnelle et que la condition n'est pas remplie,
  // passer directement à la suivante
  if (currentQuestion?.condition && !currentQuestion.condition(responses)) {
    // Utiliser useEffect pour éviter le rendu en boucle
    useEffect(() => {
      dispatch(nextStep());
    }, [dispatch, currentQuestion]);
    
    return (
      <div className="max-w-4xl mx-auto">
        <StepIndicator />
        <div className="text-center py-8">
          <p>Chargement de la prochaine question...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <StepIndicator 
        questionIndex={currentStep}
        totalQuestions={questions.length}
      />
      {currentQuestion && (
        <QuestionStep 
          question={currentQuestion}
          questionIndex={currentStep}
          totalQuestions={questions.length}
        />
      )}
    </div>
  );
}