import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { getQuestionsByPath } from '@/utils/questions';
import { UserSubscriptionInfo } from '@/types/database';

export interface FormState {
  currentStep: number;
  selectedOption: string | null;
  responses: Record<string, any>;
  currentPath: string[];
  progress: number;
}

export interface AuthState {
  user: UserSubscriptionInfo | null;
  isAuthenticated: boolean;
  loading: boolean;
}

const initialFormState: FormState = {
  currentStep: 0,
  selectedOption: null,
  responses: {},
  currentPath: ['main'],
  progress: 0,
};

const initialAuthState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: true,
};

const formSlice = createSlice({
  name: 'form',
  initialState: initialFormState,
  reducers: {
    setSelectedOption: (state, action: PayloadAction<string>) => {
      state.selectedOption = action.payload;
      state.currentPath = ['main', action.payload];
      state.currentStep = 0; // Réinitialiser à la première question de la nouvelle catégorie
      
      // Obtenir les questions pour calculer la progression
      const questions = getQuestionsByPath(state.currentPath, state.responses);
      if (questions.length > 0) {
        const answeredQuestions = questions.filter(q => 
          state.responses[q.id] !== undefined && state.responses[q.id] !== ''
        ).length;
        state.progress = Math.round((answeredQuestions / questions.length) * 100);
      }
    },
    
    setResponse: (state, action: PayloadAction<{ question: string; value: any }>) => {
      // Sauvegarder la réponse
      state.responses[action.payload.question] = action.payload.value;
      
      // Obtenir les questions actuelles
      const questions = getQuestionsByPath(state.currentPath, state.responses);
      
      // Calculer la progression basée sur les réponses données
      if (questions.length > 0) {
        const answeredQuestions = questions.filter(q => 
          state.responses[q.id] !== undefined && state.responses[q.id] !== ''
        ).length;
        state.progress = Math.round((answeredQuestions / questions.length) * 100);
      }
    },
    
    nextStep: (state) => {
      const questions = getQuestionsByPath(state.currentPath, state.responses);
      
      // Si déjà à la fin, ne rien faire
      if (state.currentStep >= questions.length) {
        return;
      }
      
      // Trouver la prochaine question valide
      let nextIndex = state.currentStep + 1;
      
      while (nextIndex < questions.length) {
        const nextQuestion = questions[nextIndex];
        
        // Si la question n'a pas de condition, l'afficher
        if (!nextQuestion.condition) {
          state.currentStep = nextIndex;
          break;
        }
        
        // Si la question a une condition et qu'elle est remplie, l'afficher
        if (nextQuestion.condition(state.responses)) {
          state.currentStep = nextIndex;
          break;
        }
        
        // Sinon, continuer à chercher
        nextIndex++;
      }
      
      // Si aucune prochaine question valide n'est trouvée
      if (nextIndex >= questions.length) {
        state.currentStep = questions.length; // Marquer comme terminé
      }
      
      // Recalculer la progression
      if (questions.length > 0) {
        const answeredQuestions = questions.filter(q => 
          state.responses[q.id] !== undefined && state.responses[q.id] !== ''
        ).length;
        state.progress = Math.round((answeredQuestions / questions.length) * 100);
      }
    },
    
prevStep: (state) => {
  const questions = getQuestionsByPath(state.currentPath, state.responses);
  
  // Si déjà à la première question d'une catégorie (hors main)
  if (state.currentStep === 0 && state.currentPath.length > 1) {
    // Revenir à la question principale
    state.selectedOption = null;
    state.currentPath = ['main'];
    state.currentStep = 0; // Position sur la question principale
    
    // Nettoyer la sélection précédente mais garder la réponse à main-1 si elle existe
    // (optionnel: vous pouvez aussi supprimer la réponse de main-1 si vous voulez repartir à zéro)
    
    // Recalculer la progression pour la page principale
    const mainQuestions = getQuestionsByPath(['main'], state.responses);
    if (mainQuestions.length > 0) {
      const answeredQuestions = mainQuestions.filter(q => 
        state.responses[q.id] !== undefined && state.responses[q.id] !== ''
      ).length;
      state.progress = Math.round((answeredQuestions / mainQuestions.length) * 100);
    }
    return;
  }
  
  // Si déjà à la première question, ne rien faire
  if (state.currentStep === 0) {
    return;
  }
  
  // Trouver la question précédente valide
  let prevIndex = state.currentStep - 1;
  
  while (prevIndex >= 0) {
    const prevQuestion = questions[prevIndex];
    
    // Si la question n'a pas de condition, l'afficher
    if (!prevQuestion.condition) {
      state.currentStep = prevIndex;
      break;
    }
    
    // Si la question a une condition et qu'elle est remplie, l'afficher
    if (prevQuestion.condition(state.responses)) {
      state.currentStep = prevIndex;
      break;
    }
    
    // Sinon, continuer à chercher en arrière
    prevIndex--;
  }
  
  // Si aucune question précédente valide n'est trouvée (ne devrait pas arriver)
  if (prevIndex < 0) {
    state.currentStep = 0;
  }
  
  // Recalculer la progression
  if (questions.length > 0) {
    const answeredQuestions = questions.filter(q => 
      state.responses[q.id] !== undefined && state.responses[q.id] !== ''
    ).length;
    state.progress = Math.round((answeredQuestions / questions.length) * 100);
  }
},
    
    jumpToStep: (state, action: PayloadAction<number>) => {
      const questions = getQuestionsByPath(state.currentPath, state.responses);
      const targetStep = action.payload;
      
      // Vérifier que l'étape cible est valide
      if (targetStep >= 0 && targetStep < questions.length) {
        const targetQuestion = questions[targetStep];
        
        // Vérifier si la question cible est accessible
        if (!targetQuestion.condition || targetQuestion.condition(state.responses)) {
          state.currentStep = targetStep;
        }
      }
      
      // Recalculer la progression
      if (questions.length > 0) {
        const answeredQuestions = questions.filter(q => 
          state.responses[q.id] !== undefined && state.responses[q.id] !== ''
        ).length;
        state.progress = Math.round((answeredQuestions / questions.length) * 100);
      }
    },
    
    resetForm: (state) => {
      state.currentStep = 0;
      state.selectedOption = null;
      state.responses = {};
      state.currentPath = ['main'];
      state.progress = 0;
    },
  },
});

export const { 
  setSelectedOption, 
  setResponse, 
  nextStep, 
  prevStep,
  jumpToStep,
  resetForm
} = formSlice.actions;

// Slice pour l'authentification
const authSlice = createSlice({
  name: 'auth',
  initialState: initialAuthState,
  reducers: {
    setUser: (state, action: PayloadAction<UserSubscriptionInfo>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.loading = false;
    },
    clearUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    updateUserSimulations: (state, action: PayloadAction<{ simulations_count: number; simulations_remaining: number }>) => {
      if (state.user) {
        state.user.simulations_count = action.payload.simulations_count;
        state.user.simulations_remaining = action.payload.simulations_remaining;
      }
    },
  },
});

export const { 
  setUser, 
  clearUser, 
  setLoading,
  updateUserSimulations
} = authSlice.actions;

export const store = configureStore({
  reducer: {
    form: formSlice.reducer,
    auth: authSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;