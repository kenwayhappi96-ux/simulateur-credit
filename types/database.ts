export interface User {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  subscription_plan: 'gratuit' | 'illimite';
  simulations_count: number;
  last_reset_date?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface UserSubscriptionInfo extends User {
  plan_name: string;
  simulations_per_month: number | null;
  commission_rate: number;
  commission_threshold: number;
  max_loan_amount: number;
  plan_description: string;
  simulations_remaining: number;
}

export interface Simulation {
  id: number;
  user_id: number;
  simulation_type: string;
  montant_demande: number;
  duree_mois: number;
  taux_applique: number;
  mensualite: number;
  cout_total: number;
  frais_ouverture: number;
  responses: Record<string, any>;
  created_at: Date;
}

export interface SubscriptionPlan {
  id: number;
  name: 'gratuit' | 'illimite';
  display_name: string;
  simulations_per_month: number | null;
  commission_rate: number;
  commission_threshold: number;
  max_loan_amount: number;
  description: string;
  price: number;
  created_at: Date;
}

export interface RegisterData {
  name: string;
  email?: string;
  phone?: string;
  password: string;
  subscription_plan: 'gratuit' | 'illimite';
}

export interface LoginData {
  identifier: string; // email ou phone
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  user?: Omit<User, 'password'>;
  token?: string;
}
