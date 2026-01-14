'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Shield, TrendingUp, Users, Award, Target, Heart, CheckCircle, Mail } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AboutPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      const data = await response.json();
      setIsAuthenticated(data.success);
    } catch (error) {
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setIsAuthenticated(false);
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header avec navbar */}
      <Navbar 
        variant="home"
        isAuthenticated={isAuthenticated}
        onLogout={handleLogout}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* En-tête */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            À propos de CrédiSmart
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Votre partenaire de confiance pour simuler et obtenir votre crédit consommation en toute simplicité
          </p>
        </motion.div>

        {/* Notre Histoire */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 mb-12"
        >
          <h2 className="text-3xl font-bold text-white mb-6">Notre Histoire</h2>
          <div className="prose prose-invert max-w-none">
            <p className="text-gray-300 text-lg leading-relaxed mb-4">
              CrédiSmart est né d'une vision simple : rendre l'accès au crédit consommation plus transparent, 
              plus rapide et plus accessible à tous. Fondée en 2025, notre plateforme révolutionne la façon 
              dont les particuliers simulent et comparent leurs options de financement.
            </p>
            <p className="text-gray-300 text-lg leading-relaxed">
              Grâce à notre technologie avancée et notre réseau de partenaires bancaires de confiance, nous 
              permettons à des milliers de personnes chaque mois de concrétiser leurs projets : achat de 
              véhicule, travaux de rénovation, acquisition d'équipement ou financement de projets personnels.
            </p>
          </div>
        </motion.div>

        {/* Nos Valeurs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-12"
        >
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Nos Valeurs</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Transparence</h3>
              <p className="text-gray-300">
                Frais clairement affichés, pas de frais cachés. Vous savez exactement ce que vous payez avant de vous engager.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-4">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Innovation</h3>
              <p className="text-gray-300">
                Technologie de pointe pour des simulations précises et instantanées adaptées à votre profil.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-4">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Accompagnement</h3>
              <p className="text-gray-300">
                Une équipe dédiée à votre écoute pour vous guider à chaque étape de votre demande de crédit.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Accompagnement en cas de refus */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-gradient-to-r from-orange-500/20 to-red-500/20 backdrop-blur-lg rounded-2xl p-8 border border-orange-500/30 mb-12"
        >
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">Aucune banque n'accepte votre demande ?</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-6">
              Ne perdez pas espoir ! Chez CrédiSmart, nous ne chassons pas nos clients. Notre équipe d'experts est là pour vous accompagner et trouver des solutions alternatives adaptées à votre situation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a
                href="https://wa.me/237690984805?text=Bonjour,%20aucune%20banque%20n'a%20accepté%20ma%20demande%20de%20crédit.%20J'aimerais%20obtenir%20de%20l'aide."
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-8 rounded-xl transition-all transform hover:scale-105 shadow-lg"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                <span>WhatsApp</span>
              </a>
              <a
                href="mailto:contact@credismart.fr?subject=Demande%20d'aide%20pour%20crédit%20refusé&body=Bonjour,%0D%0A%0D%0AAucune%20banque%20n'a%20accepté%20ma%20demande%20de%20crédit.%20J'aimerais%20obtenir%20de%20l'aide.%0D%0A%0D%0AMerci."
                className="flex items-center gap-3 bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-8 rounded-xl transition-all transform hover:scale-105 shadow-lg"
              >
                <Mail className="w-6 h-6" />
                <span>Email</span>
              </a>
              <Link
                href="/contact"
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold py-4 px-8 rounded-xl border border-white/30 transition-all"
              >
                <Mail className="w-5 h-5" />
                <span>Formulaire</span>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Comment ça marche */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 mb-12"
        >
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Comment ça marche ?</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-white">
                1
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Simulation</h3>
              <p className="text-gray-300 text-sm">
                Répondez à quelques questions sur votre projet et votre situation
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-white">
                2
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Analyse</h3>
              <p className="text-gray-300 text-sm">
                Notre algorithme analyse votre profil et calcule les meilleures offres
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-white">
                3
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Résultats</h3>
              <p className="text-gray-300 text-sm">
                Recevez instantanément votre simulation détaillée avec les mensualités
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-white">
                4
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Soumission</h3>
              <p className="text-gray-300 text-sm">
                Envoyez votre dossier aux banques partenaires en un clic
              </p>
            </div>
          </div>
        </motion.div>

        {/* Nos Tarifs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 mb-12"
        >
          <h2 className="text-3xl font-bold text-white mb-6">Nos Frais</h2>
          <div className="space-y-4">
            <div className="bg-blue-600/20 border border-blue-500/30 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">Frais d'ouverture de dossier</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-white font-semibold">Prêts jusqu'à 75 000€</p>
                    <p className="text-gray-300">Frais fixes de 5% du montant emprunté</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-white font-semibold">Prêts supérieurs à 75 000€</p>
                    <p className="text-gray-300">Frais dégressifs de 5% à 10% selon le montant</p>
                    <p className="text-gray-400 text-sm mt-1">Plus le montant est élevé, plus le pourcentage diminue</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 rounded-xl p-6">
              <h4 className="text-lg font-bold text-white mb-3">Exemple de calcul</h4>
              <div className="grid md:grid-cols-2 gap-4 text-gray-300">
                <div>
                  <p className="font-semibold text-white mb-1">Prêt de 50 000€</p>
                  <p>Frais : 50 000€ × 5% = 2 500€</p>
                </div>
                <div>
                  <p className="font-semibold text-white mb-1">Prêt de 100 000€</p>
                  <p>Frais : 100 000€ × 7% = 7 000€</p>
                </div>
              </div>
            </div>

            <p className="text-gray-400 text-sm">
              * Les frais d'ouverture de dossier sont prélevés une seule fois lors de l'acceptation du crédit. 
              Aucun frais caché ou supplément n'est appliqué par la suite.
            </p>
          </div>
        </motion.div>

        {/* Nos Chiffres */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-12"
        >
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Ils nous font confiance</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl p-8 text-center">
              <div className="text-5xl font-bold text-white mb-2">10 000+</div>
              <p className="text-blue-100">Clients satisfaits</p>
            </div>
            <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl p-8 text-center">
              <div className="text-5xl font-bold text-white mb-2">15+</div>
              <p className="text-blue-100">Banques partenaires</p>
            </div>
            <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl p-8 text-center">
              <div className="text-5xl font-bold text-white mb-2">98%</div>
              <p className="text-blue-100">Taux de satisfaction</p>
            </div>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="text-center"
        >
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Prêt à concrétiser votre projet ?
            </h2>
            <p className="text-blue-100 text-lg mb-8">
              Commencez votre simulation gratuite en quelques minutes
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="bg-white text-blue-600 px-8 py-4 rounded-xl font-bold hover:bg-blue-50 transition-colors"
              >
                Créer un compte
              </Link>
              <Link
                href="/contact"
                className="bg-blue-800 text-white px-8 py-4 rounded-xl font-bold hover:bg-blue-900 transition-colors"
              >
                Nous contacter
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
