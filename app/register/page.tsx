'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import PlanSelection from '@/components/PlanSelection';
import { signIn } from 'next-auth/react';

export default function RegisterPage() {
  const router = useRouter();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [step, setStep] = useState<'plan' | 'form'>('plan');
  const [selectedPlan, setSelectedPlan] = useState<'gratuit' | 'illimite'>('gratuit');
  const [formData, setFormData] = useState({
    name: '',
    contactType: 'email' as 'email' | 'phone',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handlePlanSelected = (plan: 'gratuit' | 'illimite') => {
    setSelectedPlan(plan);
    setStep('form');
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError('');
    try {
      await signIn('google', { callbackUrl: '/dashboard' });
    } catch (err) {
      setError('Erreur lors de la connexion avec Google');
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.password) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (formData.contactType === 'email' && !formData.email) {
      setError('Veuillez entrer votre email');
      return;
    }

    if (formData.contactType === 'phone' && !formData.phone) {
      setError('Veuillez entrer votre numéro de téléphone');
      return;
    }

    if (formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.contactType === 'email' ? formData.email : undefined,
          phone: formData.contactType === 'phone' ? formData.phone : undefined,
          password: formData.password,
          subscription_plan: selectedPlan,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Petit délai pour s'assurer que le cookie est bien défini
        await new Promise(resolve => setTimeout(resolve, 100));
        // Rediriger vers le dashboard
        router.push('/dashboard');
        // Forcer le rechargement pour s'assurer que l'authentification est prise en compte
        window.location.href = '/dashboard';
      } else {
        setError(data.message || 'Erreur lors de l\'inscription');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'plan') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-blue-400 rounded-full"
              initial={{ 
                x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000), 
                y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000),
                opacity: Math.random() 
              }}
              animate={{ 
                y: [null, Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000)],
                opacity: [null, Math.random(), 0]
              }}
              transition={{ 
                duration: Math.random() * 10 + 5, 
                repeat: Infinity,
                ease: "linear"
              }}
            />
          ))}
        </div>

        {/* Cursor glow */}
        <motion.div
          className="pointer-events-none fixed inset-0 z-30 transition duration-300"
          style={{
            background: `radial-gradient(600px at ${mousePosition.x}px ${mousePosition.y}px, rgba(59, 130, 246, 0.15), transparent 80%)`
          }}
        />

        <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8 relative z-40">
          <div className="text-center mb-6 sm:mb-8">
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 text-sm sm:text-base text-gray-300 hover:text-blue-400 transition-colors backdrop-blur-sm bg-white/5 px-4 py-2 rounded-full border border-white/10"
            >
              ← Retour à l'accueil
            </Link>
          </div>
          <PlanSelection onPlanSelected={handlePlanSelected} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden flex items-center justify-center py-6 sm:py-12 px-4">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-blue-400 rounded-full"
            initial={{ 
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000), 
              y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000),
              opacity: Math.random() 
            }}
            animate={{ 
              y: [null, Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000)],
              opacity: [null, Math.random(), 0]
            }}
            transition={{ 
              duration: Math.random() * 10 + 5, 
              repeat: Infinity,
              ease: "linear"
            }}
          />
        ))}
      </div>

      {/* Cursor glow */}
      <motion.div
        className="pointer-events-none fixed inset-0 z-30 transition duration-300"
        style={{
          background: `radial-gradient(600px at ${mousePosition.x}px ${mousePosition.y}px, rgba(59, 130, 246, 0.15), transparent 80%)`
        }}
      />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-md w-full relative z-40"
      >
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8">
          <div className="text-center mb-6 sm:mb-8">
            <motion.div
              className="inline-flex items-center gap-2 sm:gap-3 backdrop-blur-sm bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-400/30 px-4 sm:px-6 py-2 sm:py-3 rounded-full mb-4 sm:mb-6"
              whileHover={{ scale: 1.05 }}
            >
              <span className="text-white font-bold text-xs sm:text-sm">Pack sélectionné :</span>
              <span className="text-blue-400 font-black text-base sm:text-lg">
                {selectedPlan === 'gratuit' ? '🎁 Gratuit' : '🚀 Illimité'}
              </span>
            </motion.div>
            
            <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">
              Créer un compte
            </h1>
            
            <motion.button
              onClick={() => setStep('plan')}
              whileHover={{ scale: 1.05 }}
              className="text-sm text-blue-400 hover:text-blue-300 transition-colors mt-2"
            >
              ← Changer de pack
            </motion.button>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-red-500/20 backdrop-blur-sm border border-red-500/50 text-red-200 px-4 py-3 rounded-xl mb-6"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-200 mb-2">
                Nom complet *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 sm:px-4 py-3 text-base backdrop-blur-xl bg-white/10 border border-white/30 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Jean Dupont"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-200 mb-3">
                Je préfère me connecter avec :
              </label>
              <div className="flex gap-3 sm:gap-4 mb-4">
                <motion.label 
                  className="flex-1 cursor-pointer"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <input
                    type="radio"
                    name="contactType"
                    value="email"
                    checked={formData.contactType === 'email'}
                    onChange={(e) => setFormData({ ...formData, contactType: 'email' })}
                    className="sr-only peer"
                  />
                  <div className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 backdrop-blur-xl bg-white/5 border-2 border-white/20 peer-checked:border-blue-500 peer-checked:bg-blue-500/20 rounded-xl transition-all">
                    <span className="text-white font-semibold text-sm sm:text-base">📧 Email</span>
                  </div>
                </motion.label>
                
                <motion.label 
                  className="flex-1 cursor-pointer"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <input
                    type="radio"
                    name="contactType"
                    value="phone"
                    checked={formData.contactType === 'phone'}
                    onChange={(e) => setFormData({ ...formData, contactType: 'phone' })}
                    className="sr-only peer"
                  />
                  <div className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 backdrop-blur-xl bg-white/5 border-2 border-white/20 peer-checked:border-blue-500 peer-checked:bg-blue-500/20 rounded-xl transition-all">
                    <span className="text-white font-semibold text-sm sm:text-base">📱 Téléphone</span>
                  </div>
                </motion.label>
              </div>

              {formData.contactType === 'email' ? (
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 sm:px-4 py-3 text-base backdrop-blur-xl bg-white/10 border border-white/30 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="jean.dupont@example.com"
                  required
                />
              ) : (
                <div>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 sm:px-4 py-3 text-base backdrop-blur-xl bg-white/10 border border-white/30 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="06 12 34 56 78"
                    pattern="^(?:(?:\+|00)33|0)[67]\d{8}$"
                    required
                  />
                  <p className="text-xs text-gray-400 mt-1">📱 Numéro français uniquement (06/07)</p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-200 mb-2">
                Mot de passe *
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-3 sm:px-4 py-3 text-base backdrop-blur-xl bg-white/10 border border-white/30 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Minimum 6 caractères"
                required
                minLength={6}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-200 mb-2">
                Confirmer le mot de passe *
              </label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full px-3 sm:px-4 py-3 text-base backdrop-blur-xl bg-white/10 border border-white/30 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Retapez votre mot de passe"
                required
              />
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(59, 130, 246, 0.6)" }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3.5 sm:py-4 px-6 rounded-xl font-bold text-base sm:text-lg shadow-lg shadow-blue-500/50 hover:shadow-blue-500/70 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Inscription...' : '🚀 Créer mon compte'}
            </motion.button>

            {/* Séparateur */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/20"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 backdrop-blur-sm bg-slate-900/50 text-gray-300">Ou créer avec</span>
              </div>
            </div>

            {/* Bouton Google */}
            <motion.button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full backdrop-blur-xl bg-white/10 hover:bg-white/20 border-2 border-white/30 text-white py-3.5 sm:py-4 px-6 rounded-xl font-bold text-base sm:text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {googleLoading ? 'Connexion...' : 'Google'}
            </motion.button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-300">
              Vous avez déjà un compte ?{' '}
              <Link href="/login" className="text-blue-400 hover:text-blue-300 font-bold transition-colors">
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
