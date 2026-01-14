'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, FileText, Mail, LogIn, UserPlus, User, LogOut, Home } from 'lucide-react';
import Image from 'next/image';

interface NavbarProps {
  isAuthenticated?: boolean;
  onLogout?: () => void;
  variant?: 'home' | 'dashboard' | 'transparent';
}

interface MenuItem {
  label: string;
  path?: string;
  action?: string;
  icon: any;
  variant?: 'primary' | 'ghost' | 'danger';
}

export default function Navbar({ isAuthenticated = false, onLogout, variant = 'home' }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleNavigation = (path: string) => {
    setIsMenuOpen(false);
    router.push(path);
  };

  const handleLogout = () => {
    setIsMenuOpen(false);
    if (onLogout) onLogout();
  };

  // Menu items pour la page d'accueil
  const homeMenuItems: MenuItem[] = [
    { label: 'Accueil', path: '/', icon: Home },
    { label: 'À propos', path: '/about', icon: FileText },
    { label: 'Contact', path: '/contact', icon: Mail },
    { label: 'Connexion', path: '/login', icon: LogIn, variant: 'ghost' },
    { label: 'Créer un compte', path: '/register', icon: UserPlus, variant: 'primary' },
  ];

  // Menu items pour le dashboard (utilisateur connecté)
  const dashboardMenuItems: MenuItem[] = [
    { label: 'Accueil', path: '/dashboard', icon: Home },
    { label: 'À propos', path: '/about', icon: FileText },
    { label: 'Contact', path: '/contact', icon: Mail },
    { label: 'Profil', path: '/profile', icon: User, variant: 'ghost' },
    { label: 'Déconnexion', action: 'logout', icon: LogOut, variant: 'danger' },
  ];

  // Choisir le menu selon l'authentification, pas le variant
  const menuItems = isAuthenticated ? dashboardMenuItems : homeMenuItems;

  return (
    <motion.header 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8 }}
      className={`relative z-50 backdrop-blur-md ${
        variant === 'dashboard' 
          ? 'bg-white shadow-sm'
          : 'bg-white/5 border-b border-white/10'
      }`}
    >
      <div className="max-w-[95%] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link href={isAuthenticated ? '/dashboard' : '/'}>
            <motion.div 
              className="flex items-center gap-3 cursor-pointer"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <Image
                src="/logo.png"
                alt="Logo"
                width={60}
                height={60}
                className="object-contain"
                priority
              />
              <p className={`text-sm sm:text-base font-semibold ${
                variant === 'dashboard' ? 'text-gray-700' : 'text-blue-200'
              }`}>
                Prêt à long et court terme
              </p>
            </motion.div>
          </Link>

          {/* Desktop Navigation - Centre */}
          <nav className="hidden md:flex items-center space-x-4 absolute left-1/2 transform -translate-x-1/2">
            {menuItems
              .filter(item => !item.variant && item.action !== 'logout')
              .map((item) => {
                const isActive = pathname === item.path;
                return (
                  <Link key={item.label} href={item.path!}>
                    <motion.span
                      whileHover={{ scale: 1.05 }}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium cursor-pointer transition-colors ${
                        isActive
                          ? variant === 'dashboard'
                            ? 'text-blue-600 bg-blue-50 shadow-lg shadow-blue-200/50'
                            : 'text-blue-400 bg-white/10 shadow-lg shadow-blue-500/30'
                          : variant === 'dashboard'
                            ? 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                            : 'text-gray-300 hover:text-blue-400 hover:bg-white/5'
                      }`}
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </motion.span>
                  </Link>
                );
              })}
          </nav>

          {/* Desktop Navigation - Droite (Connexion/Register ou Profil/Déconnexion) */}
          <nav className="hidden md:flex items-center space-x-4">
            {menuItems
              .filter(item => item.variant === 'primary' || item.variant === 'ghost' || item.action === 'logout' || item.label === 'Profil')
              .map((item) => {
                if (item.action === 'logout') {
                  return (
                    <motion.button
                      key={item.label}
                      onClick={handleLogout}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                        variant === 'dashboard'
                          ? 'text-red-600 hover:text-red-700 hover:bg-red-50'
                          : 'text-red-400 hover:text-red-300 hover:bg-red-500/10'
                      }`}
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </motion.button>
                  );
                }

                if (item.variant === 'primary') {
                  return (
                    <Link key={item.label} href={item.path!}>
                      <motion.button
                        whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(59, 130, 246, 0.6)" }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-2.5 rounded-xl font-semibold shadow-lg shadow-blue-500/50 flex items-center gap-2"
                      >
                        <item.icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </motion.button>
                    </Link>
                  );
                }

                const isActive = pathname === item.path;
                return (
                  <Link key={item.label} href={item.path!}>
                    <motion.span
                      whileHover={{ scale: 1.05 }}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium cursor-pointer transition-colors ${
                        isActive
                          ? variant === 'dashboard'
                            ? 'text-blue-600 bg-blue-50 shadow-lg shadow-blue-200/50'
                            : 'text-blue-400 bg-white/10 shadow-lg shadow-blue-500/30'
                          : variant === 'dashboard'
                            ? 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                            : 'text-gray-300 hover:text-blue-400 hover:bg-white/5'
                      }`}
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </motion.span>
                  </Link>
                );
              })}
          </nav>

          {/* Mobile Menu Button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={toggleMenu}
            className={`md:hidden p-2 rounded-lg transition-colors ${
              variant === 'dashboard'
                ? 'text-gray-700 hover:bg-gray-100'
                : 'text-white hover:bg-white/10'
            }`}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className={`md:hidden overflow-hidden ${
              variant === 'dashboard'
                ? 'bg-white border-t border-gray-200'
                : 'bg-slate-900/95 backdrop-blur-lg border-t border-white/10'
            }`}
          >
            <nav className="px-4 py-4 space-y-2">
              {menuItems.map((item) => {
                if (item.action === 'logout') {
                  return (
                    <motion.button
                      key={item.label}
                      onClick={handleLogout}
                      whileTap={{ scale: 0.95 }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                        variant === 'dashboard'
                          ? 'text-red-600 hover:bg-red-50'
                          : 'text-red-400 hover:bg-red-500/10'
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </motion.button>
                  );
                }

                if (item.variant === 'primary') {
                  return (
                    <motion.button
                      key={item.label}
                      onClick={() => handleNavigation(item.path!)}
                      whileTap={{ scale: 0.95 }}
                      className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 py-3 rounded-lg font-semibold shadow-lg flex items-center justify-center gap-2"
                    >
                      <item.icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </motion.button>
                  );
                }

                return (
                  <motion.button
                    key={item.label}
                    onClick={() => handleNavigation(item.path!)}
                    whileTap={{ scale: 0.95 }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                      pathname === item.path
                        ? variant === 'dashboard'
                          ? 'text-blue-600 bg-blue-50 shadow-lg shadow-blue-200/50'
                          : 'text-blue-400 bg-white/10 shadow-lg shadow-blue-500/30'
                        : variant === 'dashboard'
                          ? 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                          : 'text-gray-300 hover:text-blue-400 hover:bg-white/5'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </motion.button>
                );
              })}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
