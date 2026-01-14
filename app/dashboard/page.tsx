'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { resetForm } from '@/store/store';
import { UserSubscriptionInfo, Simulation } from '@/types/database';
import { TrendingUp, Calendar, Euro, LogOut, CreditCard, BarChart3, UserCircle, FileText, X, CheckCircle, XCircle, Trash2, Send, FileDown } from 'lucide-react';
import { calculateBankResults, calculateScore, calculateDebtRatio } from '@/utils/banks';
import Image from 'next/image';
import Navbar from '@/components/Navbar';

export default function DashboardPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [user, setUser] = useState<UserSubscriptionInfo | null>(null);
  const [simulations, setSimulations] = useState<Simulation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSimulation, setSelectedSimulation] = useState<Simulation | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingSimulation, setDeletingSimulation] = useState<Simulation | null>(null);
  const [submittingSimulation, setSubmittingSimulation] = useState<number | null>(null);
  
  // États pour la pagination et les filtres
  const [currentPage, setCurrentPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState<'all' | 'accepted' | 'rejected'>('all');
  const itemsPerPage = 4;

  useEffect(() => {
    checkAuth();
  }, []);

  // Bloquer le scroll du body quand le modal est ouvert
  useEffect(() => {
    if (showDetailsModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    // Cleanup au démontage du composant
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showDetailsModal]);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      const data = await response.json();

      if (!data.success) {
        router.push('/login');
        return;
      }

      setUser(data.user);
      await loadSimulations();
    } catch (error) {
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const loadSimulations = async () => {
    try {
      const response = await fetch('/api/simulations');
      const data = await response.json();

      if (data.success) {
        setSimulations(data.simulations);
      }
    } catch (error) {
      console.error('Erreur chargement simulations:', error);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };

  const handleNewSimulation = () => {
    // Réinitialiser le formulaire avant de naviguer
    dispatch(resetForm());
    router.push('/simulator');
  };

  const handleUpgradePlan = () => {
    // Pour l'instant, on affiche juste une alerte
    // Plus tard, tu pourras intégrer un système de paiement
    if (confirm('Voulez-vous passer au Pack Illimité ?\n\n✓ Simulations illimitées\n✓ Jusqu\'à 200 000€\n✓ Frais d\'ouverture optimisés\n\nPour l\'instant, changez manuellement dans la base de données.')) {
      alert('Fonctionnalité de paiement à venir ! 💳\n\nEn attendant, modifiez le pack dans phpMyAdmin :\nUPDATE users SET subscription_plan = \'illimite\' WHERE id = ' + user?.id);
    }
  };

  const handleViewDetails = (simulation: Simulation) => {
    setSelectedSimulation(simulation);
    setShowDetailsModal(true);
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedSimulation(null);
  };

  const handleDeleteSimulation = async (simulation: Simulation) => {
    setDeletingSimulation(simulation);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deletingSimulation) return;

    try {
      const response = await fetch(`/api/simulations?id=${deletingSimulation.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        // Recharger les simulations
        await loadSimulations();
        
        // Fermer le modal
        setShowDeleteModal(false);
        setDeletingSimulation(null);
      } else {
        alert('❌ Erreur: ' + data.message);
      }
    } catch (error) {
      console.error('Erreur suppression simulation:', error);
      alert('❌ Erreur lors de la suppression');
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setDeletingSimulation(null);
  };

  const handleSubmitToAdmin = async (simulation: Simulation) => {
    if (!user) return;

    const confirmSubmit = confirm(
      '📤 Soumettre cette simulation à l\'administration ?\n\n' +
      'Toutes les informations de votre demande seront envoyées à notre équipe pour validation via WhatsApp.\n\n' +
      'Un conseiller vous contactera rapidement pour finaliser votre dossier.'
    );

    if (!confirmSubmit) return;

    setSubmittingSimulation(simulation.id);

    try {
      const response = await fetch('/api/simulations/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ simulationId: simulation.id }),
      });

      const data = await response.json();

      if (data.success) {
        // Ouvrir WhatsApp automatiquement avec le message pré-rempli
        if (data.whatsappUrl) {
          // Sur mobile, utiliser window.location.href au lieu de window.open
          // Détection mobile simple
          const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
          
          if (isMobile) {
            // Sur mobile, rediriger directement
            window.location.href = data.whatsappUrl;
          } else {
            // Sur desktop, ouvrir dans un nouvel onglet
            window.open(data.whatsappUrl, '_blank');
            alert(
              '✅ Votre demande a été préparée !\n\n' +
              'WhatsApp va s\'ouvrir avec toutes les informations pré-remplies.\n' +
              'Cliquez sur "Envoyer" pour finaliser la soumission à notre équipe.\n\n' +
              '📞 Notre conseiller vous contactera très prochainement.'
            );
          }
        }
      } else {
        alert('❌ Erreur lors de la soumission: ' + data.message);
      }
    } catch (error) {
      console.error('Erreur soumission:', error);
      alert('❌ Erreur lors de la soumission. Veuillez réessayer.');
    } finally {
      setSubmittingSimulation(null);
    }
  };

  const handleDownloadPDF = async (simulation: Simulation) => {
    if (!user) return;

    setSubmittingSimulation(simulation.id);

    try {
      const response = await fetch('/api/simulations/submit-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ simulationId: simulation.id }),
      });

      if (response.ok) {
        // Télécharger le PDF
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `demande-credit-${simulation.id}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        const data = await response.json();
        alert('❌ Erreur lors de la génération du PDF: ' + data.message);
      }
    } catch (error) {
      console.error('Erreur téléchargement PDF:', error);
      alert('❌ Erreur lors du téléchargement. Veuillez réessayer.');
    } finally {
      setSubmittingSimulation(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) return null;

  const isPremium = user.subscription_plan === 'illimite';

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Header avec Navbar */}
      <Navbar 
        variant="dashboard" 
        isAuthenticated={true}
        onLogout={handleLogout}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Bienvenue */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Bonjour, {user.name} 👋
          </h2>
          <p className="text-gray-600">
            Bienvenue sur votre espace personnel
          </p>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Pack actuel */}
          <div className={`rounded-2xl p-6 ${isPremium ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white' : 'bg-white'} shadow-lg`}>
            <div className="flex items-center gap-3 mb-4">
              <CreditCard className={`w-8 h-8 ${isPremium ? 'text-blue-200' : 'text-blue-600'}`} />
              <h3 className={`font-semibold ${isPremium ? 'text-white' : 'text-gray-900'}`}>
                Pack actuel
              </h3>
            </div>
            <p className={`text-2xl font-bold mb-2 ${isPremium ? 'text-white' : 'text-gray-900'}`}>
              {user.plan_name}
            </p>
            <p className={`text-sm ${isPremium ? 'text-blue-100' : 'text-gray-600'}`}>
              {user.plan_description}
            </p>
            {!isPremium && (
              <button 
                onClick={handleUpgradePlan}
                className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Passer à Illimité
              </button>
            )}
          </div>

          {/* Simulations restantes */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-8 h-8 text-green-600" />
              <h3 className="font-semibold text-gray-900">Simulations</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-2">
              {user.simulations_per_month === null 
                ? '∞' 
                : `${user.simulations_remaining}/${user.simulations_per_month}`}
            </p>
            <p className="text-sm text-gray-600">
              {user.simulations_per_month === null 
                ? 'Simulations illimitées' 
                : 'Restantes ce mois'}
            </p>
          </div>

          {/* Montant maximum */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <Euro className="w-8 h-8 text-purple-600" />
              <h3 className="font-semibold text-gray-900">Montant max</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-2">
              {user.max_loan_amount.toLocaleString('fr-FR')}€
            </p>
            <p className="text-sm text-gray-600">
              Emprunt maximum autorisé
            </p>
          </div>
        </div>

        {/* Action principale */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 mb-8 text-white">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-2xl font-bold mb-2">
                Prêt pour une nouvelle simulation ?
              </h3>
              <p className="text-blue-100">
                {user.simulations_remaining === 0 && user.subscription_plan === 'gratuit'
                  ? 'Vous avez atteint votre limite mensuelle. Passez au Pack Illimité !'
                  : 'Comparez les offres et trouvez le meilleur taux pour votre projet.'}
              </p>
            </div>
            {user.simulations_remaining === 0 && user.subscription_plan === 'gratuit' ? (
              <button
                onClick={handleUpgradePlan}
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors whitespace-nowrap"
              >
                🚀 Passer à Illimité
              </button>
            ) : (
              <button
                onClick={handleNewSimulation}
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors whitespace-nowrap"
              >
                Nouvelle simulation
              </button>
            )}
          </div>
        </div>

        {/* Historique des simulations */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-6 h-6 text-blue-600" />
              <h3 className="text-xl font-bold text-gray-900">
                Historique des simulations
              </h3>
            </div>
            
            {/* Filtres */}
            {simulations.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => { setFilterStatus('all'); setCurrentPage(1); }}
                  className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                    filterStatus === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Toutes
                </button>
                <button
                  onClick={() => { setFilterStatus('accepted'); setCurrentPage(1); }}
                  className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                    filterStatus === 'accepted'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  ✓ Acceptées
                </button>
                <button
                  onClick={() => { setFilterStatus('rejected'); setCurrentPage(1); }}
                  className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                    filterStatus === 'rejected'
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  ✗ Refusées
                </button>
              </div>
            )}
          </div>

          {/* Message d'instructions */}
          <div className="mb-6 bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-4">
            <div className="space-y-2">
              <p className="text-sm text-gray-700 leading-relaxed">
                📋 <span className="font-semibold">Simulations acceptées :</span> Imprimez votre simulation et envoyez-la par WhatsApp au{' '}
                <span className="font-bold text-green-600">+237 690 98 48 05</span>, ou cliquez sur le bouton{' '}
                <span className="inline-flex items-center gap-1 font-semibold text-green-600">
                  <Send className="w-3 h-3" /> Envoyer par WhatsApp
                </span>{' '}
                dans les actions pour finaliser votre dossier.
              </p>
              <p className="text-sm text-gray-700 leading-relaxed">
                🤝 <span className="font-semibold">Aucune banque n'accepte ?</span> Pas d'inquiétude !{' '}
                <span className="font-bold text-orange-600">Nos experts peuvent vous aider</span> à trouver une solution adaptée à votre situation.{' '}
                Contactez-nous via <span className="font-semibold text-green-600">WhatsApp</span> ou par{' '}
                <a href="mailto:contact@credismart.fr" className="font-semibold text-blue-600 hover:underline">email</a> pour un accompagnement personnalisé.
              </p>
            </div>
          </div>

          {simulations.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">Aucune simulation pour le moment</p>
              <button
                onClick={handleNewSimulation}
                className="text-blue-600 hover:underline font-semibold"
              >
                Créer votre première simulation
              </button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Type</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Montant</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Durée</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Taux</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Mensualité</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Frais ouverture</th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      // Filtrer les simulations
                      const filteredSims = simulations.filter(sim => {
                        const bankResults = calculateBankResults(
                          sim.responses,
                          sim.montant_demande,
                          `${sim.duree_mois} mois`
                        );
                        const hasAccepted = bankResults.some(b => b.accepted);
                        
                        if (filterStatus === 'accepted') return hasAccepted;
                        if (filterStatus === 'rejected') return !hasAccepted;
                        return true; // 'all'
                      });
                      
                      // Paginer
                      const startIndex = (currentPage - 1) * itemsPerPage;
                      const endIndex = startIndex + itemsPerPage;
                      const paginatedSims = filteredSims.slice(startIndex, endIndex);
                      
                      if (paginatedSims.length === 0) {
                        return (
                          <tr>
                            <td colSpan={8} className="text-center py-8 text-gray-500">
                              Aucune simulation {filterStatus === 'accepted' ? 'acceptée' : filterStatus === 'rejected' ? 'refusée' : ''} trouvée
                            </td>
                          </tr>
                        );
                      }
                      
                      return paginatedSims.map((sim) => {
                        // Recalculer les résultats des banques pour chaque simulation
                        const bankResults = calculateBankResults(
                          sim.responses,
                          sim.montant_demande,
                          `${sim.duree_mois} mois`
                        );
                        const acceptedBanks = bankResults.filter(b => b.accepted);
                        const bestBank = acceptedBanks.length > 0 
                          ? acceptedBanks.sort((a, b) => a.estimatedRate - b.estimatedRate)[0]
                          : null;
                        
                        // Utiliser les vraies valeurs ou les valeurs sauvegardées
                        const displayTaux = bestBank ? bestBank.estimatedRate : sim.taux_applique;
                        const displayMensualite = bestBank ? bestBank.monthlyPayment || 0 : sim.mensualite;

                        return (
                          <tr key={sim.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4 text-sm text-gray-600">
                              {new Date(sim.created_at).toLocaleDateString('fr-FR')}
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-900 capitalize">
                              {sim.simulation_type}
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-900 text-right font-medium">
                              {sim.montant_demande.toLocaleString('fr-FR')}€
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-600 text-right">
                              {sim.duree_mois} mois
                            </td>
                            <td className="py-3 px-4 text-sm text-right font-medium">
                              {bestBank ? (
                                <span className="text-green-600">{displayTaux}%</span>
                              ) : (
                                <span className="text-red-600">Aucune offre</span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-sm text-right font-medium">
                              {bestBank ? (
                                <span className="text-gray-900">{displayMensualite.toLocaleString('fr-FR')}€</span>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-sm text-green-600 text-right font-medium">
                              {sim.frais_ouverture > 0 ? `+${sim.frais_ouverture.toLocaleString('fr-FR')}€` : '-'}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => handleViewDetails(sim)}
                                  className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium hover:bg-blue-50 p-2 rounded-lg transition-colors"
                                  title="Voir les détails"
                                >
                                  <FileText className="w-4 h-4" />
                                </button>
                                {bestBank && (
                                  <>
                                    <button
                                      onClick={() => handleDownloadPDF(sim)}
                                      disabled={submittingSimulation === sim.id}
                                      className="inline-flex items-center gap-1 text-purple-600 hover:text-purple-700 text-sm font-medium hover:bg-purple-50 p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                      title="Télécharger le PDF"
                                    >
                                      <FileDown className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => handleSubmitToAdmin(sim)}
                                      disabled={submittingSimulation === sim.id}
                                      className="inline-flex items-center gap-1 text-green-600 hover:text-green-700 text-sm font-medium hover:bg-green-50 p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                      title="Envoyer via WhatsApp"
                                    >
                                      <Send className="w-4 h-4" />
                                    </button>
                                  </>
                                )}
                                <button
                                  onClick={() => handleDeleteSimulation(sim)}
                                  className="inline-flex items-center gap-1 text-red-600 hover:text-red-700 text-sm font-medium hover:bg-red-50 p-2 rounded-lg transition-colors"
                                  title="Supprimer cette simulation"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      });
                    })()}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              {(() => {
                const filteredSims = simulations.filter(sim => {
                  const bankResults = calculateBankResults(
                    sim.responses,
                    sim.montant_demande,
                    `${sim.duree_mois} mois`
                  );
                  const hasAccepted = bankResults.some(b => b.accepted);
                  
                  if (filterStatus === 'accepted') return hasAccepted;
                  if (filterStatus === 'rejected') return !hasAccepted;
                  return true;
                });
                
                const totalPages = Math.ceil(filteredSims.length / itemsPerPage);
                
                if (totalPages <= 1) return null;
                
                return (
                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600">
                      Page {currentPage} sur {totalPages} ({filteredSims.length} simulation{filteredSims.length > 1 ? 's' : ''})
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        ← Précédent
                      </button>
                      
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            currentPage === page
                              ? 'bg-blue-600 text-white'
                              : 'border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                      
                      <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        Suivant →
                      </button>
                    </div>
                  </div>
                );
              })()}
            </>
          )}
        </div>
      </main>

      {/* Modale de détails */}
      {showDetailsModal && selectedSimulation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Header de la modale */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center z-10">
              <h2 className="text-2xl font-bold text-gray-900">
                Détails de la simulation
              </h2>
              <button
                onClick={closeDetailsModal}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              {(() => {
                // Calculer les résultats des banques UNE SEULE FOIS pour tout utiliser
                const responses = selectedSimulation.responses;
                const bankResults = calculateBankResults(
                  responses,
                  selectedSimulation.montant_demande,
                  `${selectedSimulation.duree_mois} mois`
                );
                const score = calculateScore(responses);
                const debtRatio = calculateDebtRatio(responses);
                const acceptedBanks = bankResults.filter(b => b.accepted);
                const rejectedBanks = bankResults.filter(b => !b.accepted);
                const bestBank = acceptedBanks.length > 0 
                  ? acceptedBanks.sort((a, b) => a.estimatedRate - b.estimatedRate)[0]
                  : null;

                // Utiliser les valeurs du meilleur taux ou les valeurs sauvegardées si pas de banque acceptée
                const displayTaux = bestBank ? bestBank.estimatedRate : selectedSimulation.taux_applique;
                const displayMensualite = bestBank ? bestBank.monthlyPayment || 0 : selectedSimulation.mensualite;
                const displayCoutTotal = bestBank 
                  ? (bestBank.monthlyPayment || 0) * selectedSimulation.duree_mois
                  : selectedSimulation.cout_total;

                return (
                  <>
                    {/* Informations générales */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-gray-900">Informations générales</h3>
                        <div className="group relative">
                          <div className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs cursor-help">
                            ?
                          </div>
                          <div className="hidden group-hover:block absolute right-0 top-6 w-80 bg-white border border-gray-300 rounded-lg shadow-xl p-4 z-10">
                            <p className="text-xs text-gray-700">
                              <strong>Le taux et la mensualité affichés</strong> correspondent au meilleur taux parmi les banques qui ont accepté votre profil. C'est l'offre la plus avantageuse trouvée pour vous.
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Date :</span>
                          <span className="ml-2 font-medium text-gray-900">
                            {new Date(selectedSimulation.created_at).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Type :</span>
                          <span className="ml-2 font-medium text-gray-900 capitalize">
                            {selectedSimulation.simulation_type}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Montant demandé :</span>
                          <span className="ml-2 font-medium text-blue-600">
                            {selectedSimulation.montant_demande.toLocaleString('fr-FR')}€
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Durée :</span>
                          <span className="ml-2 font-medium text-gray-900">
                            {selectedSimulation.duree_mois} mois
                          </span>
                        </div>
                        {bestBank ? (
                          <>
                            <div>
                              <span className="text-gray-600">Meilleur taux trouvé :</span>
                              <span className="ml-2 font-medium text-green-600">
                                {displayTaux}%
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600">Mensualité estimée :</span>
                              <span className="ml-2 font-medium text-blue-600">
                                {displayMensualite.toLocaleString('fr-FR')}€
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600">Coût total :</span>
                              <span className="ml-2 font-medium text-gray-900">
                                {displayCoutTotal.toLocaleString('fr-FR')}€
                              </span>
                            </div>
                          </>
                        ) : (
                          <div className="col-span-2 bg-orange-50 border border-orange-200 rounded-lg p-4">
                            <div className="flex items-start gap-2">
                              <svg className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                              </svg>
                              <div className="flex-1">
                                <p className="font-semibold text-orange-900 mb-1">❌ Aucune banque n'a accepté cette demande</p>
                                <p className="text-sm text-orange-800">
                                  Toutes les banques ont refusé votre dossier. Consultez les raisons ci-dessous pour améliorer votre profil.
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                        {selectedSimulation.frais_ouverture > 0 && (
                          <div>
                            <span className="text-gray-600">Frais d'ouverture de dossier :</span>
                            <span className="ml-2 font-medium text-green-600">
                              +{selectedSimulation.frais_ouverture.toLocaleString('fr-FR')}€
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Message et bouton WhatsApp si aucune banque n'accepte - PLACEMENT HAUT */}
                    {acceptedBanks.length === 0 && rejectedBanks.length > 0 && (
                      <div className="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-300 rounded-xl p-6 mb-6">
                        <div className="text-center mb-4">
                          <h4 className="text-lg font-bold text-orange-900 mb-2">
                            🤝 Besoin d'aide pour obtenir votre crédit ?
                          </h4>
                          <p className="text-orange-800">
                            Nos experts peuvent vous accompagner pour trouver une solution adaptée à votre situation.
                          </p>
                        </div>
                        <a
                          href="https://wa.me/237690984805?text=Bonjour,%20aucune%20banque%20n'a%20accepté%20ma%20demande%20de%20crédit.%20J'aimerais%20obtenir%20de%20l'aide."
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-3 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-105 shadow-lg w-full"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                          </svg>
                          <span>Nous contacter sur WhatsApp</span>
                        </a>
                      </div>
                    )}

                    {/* Votre profil financier */}
                    <div className="bg-blue-50 rounded-lg p-4 mb-6 border border-blue-200">
                      <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Votre profil financier
                      </h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        {(() => {
                          const simType = selectedSimulation.simulation_type;
                          let apportKey = '';
                          let revenuKey = '';
                          
                          if (simType === 'vehicule') {
                            apportKey = 'vehicule-4';
                            revenuKey = 'vehicule-11';
                          } else if (simType === 'travaux') {
                            apportKey = ''; // Pas d'apport pour travaux
                            revenuKey = 'travaux-11';
                          } else if (simType === 'equipement') {
                            apportKey = ''; // Pas d'apport pour équipement
                            revenuKey = 'equipement-9';
                          } else if (simType === 'argent') {
                            apportKey = ''; // Pas d'apport pour argent
                            revenuKey = 'argent-9';
                          }
                          
                          const apportValue = apportKey ? (responses[apportKey] || 0) : 0;
                          const revenuValue = revenuKey ? (responses[revenuKey] || 0) : 0;
                          
                          return (
                            <>
                              {apportKey && (
                                <div className="bg-white rounded-lg p-3">
                                  <span className="text-gray-600 block mb-1">💰 Apport personnel :</span>
                                  <span className="text-lg font-bold text-green-600">
                                    {Number(apportValue).toLocaleString('fr-FR')}€
                                  </span>
                                  <div className="text-xs text-gray-500 mt-1">
                                    {Number(apportValue) === 0 && '⚠️ Aucun apport'}
                                    {Number(apportValue) > 0 && `${Math.round((Number(apportValue) / selectedSimulation.montant_demande) * 100)}% du montant`}
                                  </div>
                                </div>
                              )}
                              <div className="bg-white rounded-lg p-3">
                                <span className="text-gray-600 block mb-1">📊 Revenus mensuels :</span>
                                <span className="text-lg font-bold text-blue-600">
                                  {Number(revenuValue).toLocaleString('fr-FR')}€
                                </span>
                                <div className="text-xs text-gray-500 mt-1">
                                  Taux d'endettement : {debtRatio.toFixed(1)}%
                                </div>
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    </div>

                    {/* Résultats des banques */}
                    <div className="mb-6">
                      <h3 className="font-semibold text-gray-900 mb-3">Résultats des banques</h3>
                      
                      {/* Carte de la meilleure offre */}
                      {bestBank && (
                        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-6 mb-6 text-white">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h4 className="text-lg font-bold mb-1">🎉 Meilleure offre trouvée !</h4>
                              <p className="text-green-100 text-sm">Votre option la plus avantageuse</p>
                            </div>
                            <div className="relative w-16 h-16">
                              <Image
                                src={bestBank.bank.logo}
                                alt={bestBank.bank.name}
                                fill
                                className="object-contain"
                              />
                            </div>
                          </div>
                          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <div className="text-green-100 mb-1">Banque</div>
                                <div className="text-lg font-bold">{bestBank.bank.name}</div>
                              </div>
                              <div>
                                <div className="text-green-100 mb-1">Taux</div>
                                <div className="text-lg font-bold">{bestBank.estimatedRate}%</div>
                              </div>
                              <div>
                                <div className="text-green-100 mb-1">Mensualité</div>
                                <div className="text-lg font-bold">{bestBank.monthlyPayment?.toLocaleString('fr-FR')}€</div>
                              </div>
                              <div>
                                <div className="text-green-100 mb-1">Coût total</div>
                                <div className="text-lg font-bold">
                                  {((bestBank.monthlyPayment || 0) * selectedSimulation.duree_mois).toLocaleString('fr-FR')}€
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Score global */}
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600">Score global</p>
                            <p className="text-2xl font-bold text-blue-600">{score}/100</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Taux d'endettement</p>
                            <p className="text-2xl font-bold text-gray-900">{debtRatio.toFixed(1)}%</p>
                          </div>
                        </div>
                      </div>
                      {acceptedBanks.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-sm font-semibold text-green-600 mb-2 flex items-center gap-2">
                            <CheckCircle className="w-5 h-5" />
                            Banques qui acceptent ({acceptedBanks.length})
                          </h4>
                          <div className="space-y-2">
                            {acceptedBanks.map((result, index) => (
                              <div
                                key={index}
                                className="bg-green-50 border border-green-200 rounded-lg p-4"
                              >
                                <div className="flex justify-between items-start mb-2">
                                  <h5 className="font-semibold text-gray-900">{result.bank.name}</h5>
                                  <span className="text-green-600 font-medium">✓ Accepté</span>
                                </div>
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Taux estimé :</span>
                                    <span className="font-medium text-gray-900">
                                      {result.estimatedRate}%
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Mensualité :</span>
                                    <span className="font-medium text-gray-900">
                                      {result.monthlyPayment?.toLocaleString('fr-FR')}€
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Coût total :</span>
                                    <span className="font-medium text-gray-900">
                                      {((result.monthlyPayment || 0) * selectedSimulation.duree_mois).toLocaleString('fr-FR')}€
                                    </span>
                                  </div>
                                </div>
                                {result.reason && (
                                  <p className="text-xs text-gray-600 mt-2">
                                    {result.reason}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Banques refusées */}
                      {rejectedBanks.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-red-600 mb-2 flex items-center gap-2">
                            <XCircle className="w-5 h-5" />
                            Banques qui refusent ({rejectedBanks.length})
                          </h4>
                          <div className="space-y-2">
                            {rejectedBanks.map((result, index) => (
                              <div
                                key={index}
                                className="bg-red-50 border border-red-200 rounded-lg p-4"
                              >
                                <div className="flex justify-between items-start mb-2">
                                  <h5 className="font-semibold text-gray-900">{result.bank.name}</h5>
                                  <span className="text-red-600 font-medium">✗ Refusé</span>
                                </div>
                                {result.reason && (
                                  <p className="text-sm text-red-700 bg-red-100 rounded px-2 py-1">
                                    {result.reason}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {acceptedBanks.length === 0 && rejectedBanks.length === 0 && (
                        <p className="text-gray-500 text-center py-4">
                          Aucune banque trouvée pour cette simulation
                        </p>
                      )}
                    </div>
                  </>
                );
              })()}

              {/* Bouton fermer */}
              <div className="flex justify-end">
                <button
                  onClick={closeDetailsModal}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmation de suppression */}
      {showDeleteModal && deletingSimulation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-4 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <Trash2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Confirmer la suppression</h3>
                  <p className="text-red-100 text-sm">Cette action est irréversible</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <p className="text-gray-700 mb-4">
                Êtes-vous sûr de vouloir supprimer cette simulation ?
              </p>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Type :</span>
                    <span className="font-semibold text-gray-900">
                      {deletingSimulation.simulation_type}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Montant :</span>
                    <span className="font-semibold text-gray-900">
                      {deletingSimulation.montant_demande.toLocaleString('fr-FR')}€
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date :</span>
                    <span className="font-semibold text-gray-900">
                      {new Date(deletingSimulation.created_at).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Boutons */}
              <div className="flex gap-3">
                <button
                  onClick={cancelDelete}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                >
                  ❌ Non, annuler
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all shadow-lg"
                >
                  ✅ Oui, supprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
