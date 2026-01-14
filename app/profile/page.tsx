'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { UserCircle, Mail, Phone, Lock, Save, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import Navbar from '@/components/Navbar';

interface UserProfile {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  subscription_plan: string;
  created_at: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  
  // État pour le changement de nom
  const [nameForm, setNameForm] = useState({
    name: '',
  });
  const [nameLoading, setNameLoading] = useState(false);
  const [nameSuccess, setNameSuccess] = useState('');
  const [nameError, setNameError] = useState('');

  // État pour le changement d'email
  const [emailForm, setEmailForm] = useState({
    email: '',
    currentPassword: '',
  });
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState('');
  const [emailError, setEmailError] = useState('');

  // État pour le changement de mot de passe
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // État pour le changement de numéro WhatsApp
  const [phoneForm, setPhoneForm] = useState({
    phone: '',
    currentPassword: '',
  });
  const [phoneLoading, setPhoneLoading] = useState(false);
  const [phoneSuccess, setPhoneSuccess] = useState('');
  const [phoneError, setPhoneError] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await fetch('/api/auth/me');
      const data = await response.json();

      if (!data.success) {
        router.push('/login');
        return;
      }

      setUser(data.user);
      setNameForm({ name: data.user.name });
      setEmailForm({ email: data.user.email || '', currentPassword: '' });
      setPhoneForm({ phone: data.user.phone || '', currentPassword: '' });
    } catch (error) {
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };

  // Changement de nom (sans mot de passe requis)
  const handleNameChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setNameError('');
    setNameSuccess('');

    if (!nameForm.name.trim()) {
      setNameError('Le nom ne peut pas être vide');
      return;
    }

    setNameLoading(true);

    try {
      const response = await fetch('/api/profile/update-name', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: nameForm.name }),
      });

      const data = await response.json();

      if (data.success) {
        setNameSuccess('Nom mis à jour avec succès !');
        setUser({ ...user!, name: nameForm.name });
        setTimeout(() => setNameSuccess(''), 3000);
      } else {
        setNameError(data.message || 'Erreur lors de la mise à jour');
      }
    } catch (error) {
      setNameError('Erreur de connexion au serveur');
    } finally {
      setNameLoading(false);
    }
  };

  // Changement d'email (avec mot de passe requis)
  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError('');
    setEmailSuccess('');

    if (!emailForm.email.trim()) {
      setEmailError('L\'email ne peut pas être vide');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailForm.email)) {
      setEmailError('Format d\'email invalide');
      return;
    }

    if (!emailForm.currentPassword) {
      setEmailError('Veuillez entrer votre mot de passe actuel');
      return;
    }

    setEmailLoading(true);

    try {
      const response = await fetch('/api/profile/update-email', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: emailForm.email,
          currentPassword: emailForm.currentPassword,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setEmailSuccess('Email mis à jour avec succès !');
        setUser({ ...user!, email: emailForm.email });
        setEmailForm({ ...emailForm, currentPassword: '' });
        setTimeout(() => setEmailSuccess(''), 3000);
      } else {
        setEmailError(data.message || 'Erreur lors de la mise à jour');
      }
    } catch (error) {
      setEmailError('Erreur de connexion au serveur');
    } finally {
      setEmailLoading(false);
    }
  };

  // Changement de mot de passe (avec mot de passe actuel requis)
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!passwordForm.currentPassword) {
      setPasswordError('Veuillez entrer votre mot de passe actuel');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordError('Le nouveau mot de passe doit contenir au moins 6 caractères');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('Les mots de passe ne correspondent pas');
      return;
    }

    setPasswordLoading(true);

    try {
      const response = await fetch('/api/profile/update-password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setPasswordSuccess('Mot de passe mis à jour avec succès !');
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        setTimeout(() => setPasswordSuccess(''), 3000);
      } else {
        setPasswordError(data.message || 'Erreur lors de la mise à jour');
      }
    } catch (error) {
      setPasswordError('Erreur de connexion au serveur');
    } finally {
      setPasswordLoading(false);
    }
  };

  // Changement de numéro WhatsApp
  const handlePhoneChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPhoneError('');
    setPhoneSuccess('');

    if (!phoneForm.phone.trim()) {
      setPhoneError('Le numéro de téléphone ne peut pas être vide');
      return;
    }

    // Validation format français
    const cleanPhone = phoneForm.phone.replace(/[\s.-]/g, '');
    const frenchPhoneRegex = /^(?:(?:\+|00)33|0)[67]\d{8}$/;
    if (!frenchPhoneRegex.test(cleanPhone)) {
      setPhoneError('Format de numéro invalide. Utilisez un numéro mobile français (06/07)');
      return;
    }

    // Si l'utilisateur a déjà un numéro, le mot de passe est requis
    if (user?.phone && !phoneForm.currentPassword) {
      setPhoneError('Veuillez entrer votre mot de passe actuel');
      return;
    }

    setPhoneLoading(true);

    try {
      const response = await fetch('/api/profile/update-phone', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: phoneForm.phone,
          currentPassword: phoneForm.currentPassword || undefined,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setPhoneSuccess('Numéro WhatsApp mis à jour avec succès !');
        setUser({ ...user!, phone: phoneForm.phone });
        setPhoneForm({ ...phoneForm, currentPassword: '' });
        setTimeout(() => setPhoneSuccess(''), 3000);
      } else {
        setPhoneError(data.message || 'Erreur lors de la mise à jour');
      }
    } catch (error) {
      setPhoneError('Erreur de connexion au serveur');
    } finally {
      setPhoneLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
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
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mon Profil</h1>
          <p className="text-gray-600 mt-2">
            Gérez vos informations personnelles et votre sécurité
          </p>
        </div>

        {/* Informations du compte */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <UserCircle className="w-6 h-6 text-blue-600" />
            Informations du compte
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Email :</span>
              <span className="ml-2 font-medium text-gray-900">
                {user.email || 'Non renseigné'}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Téléphone :</span>
              <span className="ml-2 font-medium text-gray-900">
                {user.phone || 'Non renseigné'}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Pack :</span>
              <span className="ml-2 font-medium text-blue-600">
                {user.subscription_plan === 'gratuit' ? 'Pack Gratuit' : 'Pack Illimité'}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Membre depuis :</span>
              <span className="ml-2 font-medium text-gray-900">
                {new Date(user.created_at).toLocaleDateString('fr-FR')}
              </span>
            </div>
          </div>
        </div>

        {/* Formulaire de changement de nom */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <UserCircle className="w-6 h-6 text-green-600" />
            Changer le nom
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Aucun mot de passe requis pour modifier votre nom
          </p>

          {nameSuccess && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
              {nameSuccess}
            </div>
          )}

          {nameError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {nameError}
            </div>
          )}

          <form onSubmit={handleNameChange}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nouveau nom
              </label>
              <input
                type="text"
                value={nameForm.name}
                onChange={(e) => setNameForm({ name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Votre nom complet"
                required
              />
            </div>

            <button
              type="submit"
              disabled={nameLoading}
              className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <Save className="w-5 h-5" />
              {nameLoading ? 'Enregistrement...' : 'Enregistrer le nom'}
            </button>
          </form>
        </div>

        {/* Formulaire de changement d'email */}
        {user.email && (
          <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Mail className="w-6 h-6 text-blue-600" />
              Changer l'email
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              🔒 Mot de passe requis pour des raisons de sécurité
            </p>

            {emailSuccess && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
                {emailSuccess}
              </div>
            )}

            {emailError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                {emailError}
              </div>
            )}

            <form onSubmit={handleEmailChange}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nouvel email
                </label>
                <input
                  type="email"
                  value={emailForm.email}
                  onChange={(e) => setEmailForm({ ...emailForm, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="nouveau@example.com"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mot de passe actuel *
                </label>
                <input
                  type="password"
                  value={emailForm.currentPassword}
                  onChange={(e) => setEmailForm({ ...emailForm, currentPassword: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Votre mot de passe actuel"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={emailLoading}
                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                <Save className="w-5 h-5" />
                {emailLoading ? 'Enregistrement...' : 'Enregistrer l\'email'}
              </button>
            </form>
          </div>
        )}

        {/* Formulaire de changement de numéro WhatsApp */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Phone className="w-6 h-6 text-green-600" />
            {user.phone ? 'Modifier le numéro WhatsApp' : 'Ajouter un numéro WhatsApp'}
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            {user.phone 
              ? '🔒 Mot de passe requis pour modifier votre numéro'
              : '📩 Ajoutez votre numéro pour être contacté par WhatsApp'
            }
          </p>

          {phoneSuccess && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
              {phoneSuccess}
            </div>
          )}

          {phoneError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {phoneError}
            </div>
          )}

          <form onSubmit={handlePhoneChange}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Numéro WhatsApp (France uniquement)
              </label>
              <input
                type="tel"
                value={phoneForm.phone}
                onChange={(e) => setPhoneForm({ ...phoneForm, phone: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="06 12 34 56 78 ou +33 6 12 34 56 78"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                📱 Format accepté : 06/07 XX XX XX XX ou +33 6/7 XX XX XX XX
              </p>
            </div>

            {user.phone && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mot de passe actuel *
                </label>
                <input
                  type="password"
                  value={phoneForm.currentPassword}
                  onChange={(e) => setPhoneForm({ ...phoneForm, currentPassword: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Votre mot de passe actuel"
                  required={!!user.phone}
                />
              </div>
            )}

            <button
              type="submit"
              disabled={phoneLoading}
              className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <Save className="w-5 h-5" />
              {phoneLoading ? 'Enregistrement...' : (user.phone ? 'Modifier le numéro' : 'Ajouter le numéro')}
            </button>
          </form>
        </div>

        {/* Formulaire de changement de mot de passe */}
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Lock className="w-6 h-6 text-red-600" />
            Changer le mot de passe
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            🔒 Mot de passe actuel requis pour des raisons de sécurité
          </p>

          {passwordSuccess && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
              {passwordSuccess}
            </div>
          )}

          {passwordError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {passwordError}
            </div>
          )}

          <form onSubmit={handlePasswordChange}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe actuel *
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent pr-12"
                  placeholder="Votre mot de passe actuel"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nouveau mot de passe *
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent pr-12"
                  placeholder="Au moins 6 caractères"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirmer le nouveau mot de passe *
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent pr-12"
                  placeholder="Confirmez le nouveau mot de passe"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={passwordLoading}
              className="flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <Lock className="w-5 h-5" />
              {passwordLoading ? 'Enregistrement...' : 'Changer le mot de passe'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
