'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { setUser, setLoading } from '@/store/store';
import CreditSimulator from '@/components/CreditSimulator';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

export default function SimulatorPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user, isAuthenticated, loading } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    dispatch(setLoading(true));
    try {
      const response = await fetch('/api/auth/me');
      const data = await response.json();

      if (!data.success) {
        router.push('/register');
        return;
      }

      dispatch(setUser(data.user));

      // Vérifier si l'utilisateur peut faire une simulation
      if (data.user.subscription_plan === 'gratuit' && data.user.simulations_remaining <= 0) {
        alert('⚠️ Limite atteinte !\n\nVous avez utilisé vos 3 simulations gratuites ce mois.\n\nPassez au Pack Illimité pour continuer !');
        router.push('/dashboard');
        return;
      }
    } catch (error) {
      router.push('/register');
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Header avec Navbar */}
      <Navbar 
        variant="dashboard"
        isAuthenticated={true}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <main className="py-6 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              Simulez votre crédit consommation
              <span className="block text-blue-600">en 2 minutes</span>
            </h1>
            <p className="text-base sm:text-xl text-gray-600 max-w-3xl mx-auto">
              Obtenez une estimation personnalisée selon votre projet et votre profil
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
            <CreditSimulator />
          </div>
        </div>
      </main>
    </div>
  );
}
