'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';

export default function Home() {
  const router = useRouter();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [particles, setParticles] = useState<Array<{ x: number; y: number; opacity: number; duration: number }>>([]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Générer les particules uniquement côté client
  useEffect(() => {
    setParticles(
      Array.from({ length: 20 }, () => ({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        opacity: Math.random(),
        duration: Math.random() * 10 + 5
      }))
    );
  }, []);

  const handleStartSimulation = () => {
    router.push('/register');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        {particles.map((particle, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-blue-400 rounded-full"
            initial={{ 
              x: particle.x, 
              y: particle.y,
              opacity: particle.opacity 
            }}
            animate={{ 
              y: [null, Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1080)],
              opacity: [null, Math.random(), 0]
            }}
            transition={{ 
              duration: particle.duration, 
              repeat: Infinity,
              ease: "linear"
            }}
          />
        ))}
      </div>

      {/* Cursor glow effect */}
      <motion.div
        className="pointer-events-none fixed inset-0 z-30 transition duration-300"
        style={{
          background: `radial-gradient(600px at ${mousePosition.x}px ${mousePosition.y}px, rgba(59, 130, 246, 0.15), transparent 80%)`
        }}
      />

      {/* Header avec Navbar */}
      <Navbar variant="home" />

      {/* Hero Section with Background Image */}
      <main className="relative z-10">
        {/* Hero avec image de fond */}
        <div className="relative h-[50vh] min-h-[340px] sm:h-[60vh] sm:min-h-[500px] overflow-hidden">
          {/* Image de fond avec overlay */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900/95 via-blue-900/80 to-transparent z-10"></div>
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: `url('https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=2070')`
              }}
            ></div>
          </div>

          {/* Contenu du hero - centré */}
          <div className="relative z-20 h-full flex items-center justify-center">
            <div className="max-w-[95%] mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-center">
              <div className="flex flex-col items-center justify-center text-center max-w-4xl">
                {/* Titre principal centré */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="mb-8"
                >
                  <motion.h1 
                    className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl font-black text-white mb-4 leading-tight"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1 }}
                  >
                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500">
                      Votre avenir sur roues
                    </span>
                    <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-100">
                      commence ici
                    </span>
                  </motion.h1>
                  
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="text-base sm:text-lg text-gray-200 mb-8"
                  >
                    Obtenez une estimation personnalisée selon votre projet
                  </motion.p>
                </motion.div>

                {/* Bouton centré en bas */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                >
                  <motion.button
                    onClick={handleStartSimulation}
                    whileHover={{ 
                      scale: 1.05, 
                      boxShadow: "0 0 40px rgba(59, 130, 246, 0.8)",
                    }}
                    whileTap={{ scale: 0.95 }}
                    className="relative bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-600 bg-size-200 bg-pos-0 hover:bg-pos-100 text-white px-8 py-3 sm:px-10 sm:py-4 rounded-xl text-base sm:text-lg font-bold shadow-2xl shadow-blue-500/50 transition-all duration-500"
                  >
                    <span className="relative z-10">Commencer ma simulation</span>
                  </motion.button>
                </motion.div>
              </div>
            </div>
          </div>
        </div>

        {/* Section Features et Stats */}
        <div className="max-w-[95%] mx-auto px-2 sm:px-4 lg:px-8 py-10 sm:py-20">
          {/* Features avec glassmorphism */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-10 sm:mb-16">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.9 }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-5 sm:p-8 shadow-2xl text-center group"
            >
              <motion.div 
                className="h-20 w-20 bg-gradient-to-br from-blue-500/30 to-cyan-500/30 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:shadow-lg group-hover:shadow-blue-500/50 transition-shadow overflow-hidden p-3"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <Image
                  src="https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=100&h=100&fit=crop"
                  alt="Pack Gratuit"
                  width={80}
                  height={80}
                  className="object-cover rounded-lg"
                />
              </motion.div>
              <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-white">Pack Gratuit</h3>
              <p className="text-gray-300 mb-4 sm:mb-6">
                3 simulations par mois pour découvrir notre service
              </p>
              <ul className="text-xs sm:text-sm text-gray-300 space-y-2 sm:space-y-3 text-left">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                  3 simulations/mois
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                  Jusqu'à 75 000€
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                  Historique complet
                </li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.1 }}
              whileHover={{ y: -15, scale: 1.05 }}
              className="backdrop-blur-xl bg-gradient-to-br from-blue-600/40 to-cyan-600/40 border-2 border-blue-400/50 rounded-3xl p-5 pt-10 sm:p-8 sm:pt-12 shadow-2xl shadow-blue-500/50 text-center relative overflow-visible group"
            >
              <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 z-20">
                <motion.span 
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="bg-gradient-to-r from-yellow-400 to-orange-400 text-blue-900 px-6 py-2.5 rounded-full text-sm font-black shadow-xl whitespace-nowrap inline-block"
                >
                  ⭐ RECOMMANDÉ
                </motion.span>
              </div>
              <motion.div 
                className="h-20 w-20 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/50 overflow-hidden p-3"
                whileHover={{ rotate: 360, scale: 1.2 }}
                transition={{ duration: 0.6 }}
              >
                <Image
                  src="https://images.unsplash.com/photo-1640622300473-977435c38c04?w=100&h=100&fit=crop"
                  alt="Pack Illimité"
                  width={80}
                  height={80}
                  className="object-cover rounded-lg"
                />
              </motion.div>
              <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-white">Pack Illimité</h3>
              <p className="text-blue-100 mb-4 sm:mb-6">
                Pour maximiser vos chances d'obtenir le meilleur taux
              </p>
              <ul className="text-xs sm:text-sm text-blue-100 space-y-2 sm:space-y-3 text-left">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-cyan-300 rounded-full"></span>
                  Simulations illimitées
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-cyan-300 rounded-full"></span>
                  Jusqu'à 200 000€
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-cyan-300 rounded-full"></span>
                  Taux préférentiels
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-cyan-300 rounded-full"></span>
                  Support prioritaire
                </li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 1.3 }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-5 sm:p-8 shadow-2xl text-center group"
            >
              <motion.div 
                className="h-20 w-20 bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:shadow-lg group-hover:shadow-purple-500/50 transition-shadow overflow-hidden p-3"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <Image
                  src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=100&h=100&fit=crop"
                  alt="Réponse Instantanée"
                  width={80}
                  height={80}
                  className="object-cover rounded-lg"
                />
              </motion.div>
              <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-white">Réponse Instantanée</h3>
              <p className="text-gray-300 mb-4 sm:mb-6">
                Algorithme intelligent pour des résultats précis en temps réel
              </p>
              <ul className="text-xs sm:text-sm text-gray-300 space-y-2 sm:space-y-3 text-left">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-purple-400 rounded-full"></span>
                  14 banques partenaires
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-purple-400 rounded-full"></span>
                  Taux personnalisés
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-purple-400 rounded-full"></span>
                  Analyse détaillée
                </li>
              </ul>
            </motion.div>
          </div>

          {/* Section À propos */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.4 }}
            className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl overflow-hidden shadow-2xl mb-10 sm:mb-16"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
              {/* Image à gauche */}
              <div className="relative h-40 xs:h-56 sm:h-64 md:h-auto min-h-[200px] sm:min-h-[400px]">
                <Image
                  src="https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=800&h=600&fit=crop"
                  alt="À propos de SimulateurCrédit"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-slate-900/50"></div>
              </div>
              
              {/* Texte à droite */}
              <div className="p-5 sm:p-8 md:p-12 flex flex-col justify-center">
                <motion.h2 
                  className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 sm:mb-6"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 1.6 }}
                >
                  À propos de <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">SimulateurCrédit</span>
                </motion.h2>
                
                <motion.div 
                  className="space-y-3 sm:space-y-4 text-gray-300"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 1.8 }}
                >
                  <p className="text-lg leading-relaxed">
                    <span className="text-blue-400 font-semibold">SimulateurCrédit</span> est votre partenaire de confiance pour trouver le crédit qui vous convient. Notre plateforme intelligente compare en temps réel les offres de <span className="text-cyan-400 font-semibold">14 banques partenaires</span> européennes.
                  </p>
                  
                  <p className="leading-relaxed">
                    Grâce à notre algorithme de scoring avancé, nous analysons votre profil financier pour vous proposer les meilleures options de financement adaptées à votre situation personnelle.
                  </p>
                  
                  <div className="grid grid-cols-2 gap-2 sm:gap-4 mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-white/10">
                    <div>
                      <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 mb-1">
                        100%
                      </div>
                      <div className="text-sm text-gray-400">Gratuit & sécurisé</div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 mb-1">
                        2 min
                      </div>
                      <div className="text-sm text-gray-400">Pour simuler</div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Stats section */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.5 }}
            className="backdrop-blur-xl bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border border-white/20 rounded-3xl p-6 sm:p-12 shadow-2xl"
          >
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8 text-center">
              <div>
                <motion.div 
                  className="text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 mb-1 sm:mb-2"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 1.7 }}
                >
                  2 min
                </motion.div>
                <div className="text-gray-300 text-xs sm:text-base font-medium">Temps moyen</div>
              </div>
              <div>
                <motion.div 
                  className="text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 mb-1 sm:mb-2"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 1.9 }}
                >
                  14
                </motion.div>
                <div className="text-gray-300 text-xs sm:text-base font-medium">Banques partenaires</div>
              </div>
              <div>
                <motion.div 
                  className="text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 mb-1 sm:mb-2"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 2.1 }}
                >
                  200k€
                </motion.div>
                <div className="text-gray-300 text-xs sm:text-base font-medium">Montant maximum</div>
              </div>
              <div>
                <motion.div 
                  className="text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 mb-1 sm:mb-2"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 2.3 }}
                >
                  100%
                </motion.div>
                <div className="text-gray-300 text-xs sm:text-base font-medium">Gratuit & sans engagement</div>
              </div>
            </div>
          </motion.div>

          {/* Carrousel des banques partenaires */}
        </div>
      </main>

      {/* Carrousel pleine largeur */}
      <div className="w-full overflow-hidden bg-slate-900/50 py-8 sm:py-12">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 2.5 }}
        >
          <h3 className="text-xl sm:text-2xl font-bold text-center text-white mb-6 sm:mb-8">
            Nos <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Partenaires</span>
          </h3>
          
          <div className="overflow-hidden">
            {/* Conteneur du défilement */}
            <div className="flex animate-scroll gap-4 sm:gap-8">
                {/* Premier groupe - 14 banques */}
                {[
                  { name: 'BNP Paribas', logo: '/banks/bnp.png' },
                  { name: 'Crédit Agricole', logo: '/banks/ca.png' },
                  { name: 'Société Générale', logo: '/banks/societe.png' },
                  { name: 'LCL', logo: '/banks/lcl.png' },
                  { name: 'Boursorama', logo: '/banks/bourso.png' },
                  { name: 'Fortuneo', logo: '/banks/fortuneo.png' },
                  { name: 'Deutsche Bank', logo: '/banks/deutsche-bank.png' },
                  { name: 'Commerzbank', logo: '/banks/commerzbank.png' },
                  { name: 'Santander', logo: '/banks/santander.png' },
                  { name: 'BBVA', logo: '/banks/bbva.png' },
                  { name: 'Intesa Sanpaolo', logo: '/banks/intesa.png' },
                  { name: 'UniCredit', logo: '/banks/unicredit.png' },
                  { name: 'ING', logo: '/banks/ing.png' },
                  { name: 'ABN AMRO', logo: '/banks/abn-amro.png' },
                ].map((bank, index) => (
                  <div
                    key={`first-${index}`}
                    className="flex-shrink-0 w-32 h-16 xs:w-40 xs:h-20 sm:w-56 sm:h-32 relative grayscale hover:grayscale-0 transition-all duration-300 hover:scale-110"
                  >
                    <Image
                      src={bank.logo}
                      alt={bank.name}
                      fill
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                ))}
                {/* Deuxième groupe - duplication exacte pour boucle infinie */}
                {[
                  { name: 'BNP Paribas', logo: '/banks/bnp.png' },
                  { name: 'Crédit Agricole', logo: '/banks/ca.png' },
                  { name: 'Société Générale', logo: '/banks/societe.png' },
                  { name: 'LCL', logo: '/banks/lcl.png' },
                  { name: 'Boursorama', logo: '/banks/bourso.png' },
                  { name: 'Fortuneo', logo: '/banks/fortuneo.png' },
                  { name: 'Deutsche Bank', logo: '/banks/deutsche-bank.png' },
                  { name: 'Commerzbank', logo: '/banks/commerzbank.png' },
                  { name: 'Santander', logo: '/banks/santander.png' },
                  { name: 'BBVA', logo: '/banks/bbva.png' },
                  { name: 'Intesa Sanpaolo', logo: '/banks/intesa.png' },
                  { name: 'UniCredit', logo: '/banks/unicredit.png' },
                  { name: 'ING', logo: '/banks/ing.png' },
                  { name: 'ABN AMRO', logo: '/banks/abn-amro.png' },
                ].map((bank, index) => (
                  <div
                    key={`second-${index}`}
                    className="flex-shrink-0 w-32 h-16 xs:w-40 xs:h-20 sm:w-56 sm:h-32 relative grayscale hover:grayscale-0 transition-all duration-300 hover:scale-110"
                  >
                    <Image
                      src={bank.logo}
                      alt={bank.name}
                      fill
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
      </div>

      {/* Footer */}
      <motion.footer 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 2.5 }}
        className="relative z-10 backdrop-blur-md bg-white/5 border-t border-white/10 py-6 sm:py-8 mt-10 sm:mt-20"
      >
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <div className="text-center text-gray-400 text-xs sm:text-sm">
            <p>© 2025 Prêt à long et court terme. Tous droits réservés.</p>
            <p className="mt-1 sm:mt-2">Un service sécurisé pour vos projets de financement</p>
          </div>
        </div>
      </motion.footer>
    </div>
  );
}