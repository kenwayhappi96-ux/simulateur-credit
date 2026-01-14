-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1:3306
-- Généré le : lun. 05 jan. 2026 à 14:35
-- Version du serveur : 8.2.0
-- Version de PHP : 8.2.13

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `simulateur_credit`
--

-- --------------------------------------------------------

--
-- Structure de la table `password_reset_codes`
--

DROP TABLE IF EXISTS `password_reset_codes`;
CREATE TABLE IF NOT EXISTS `password_reset_codes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `code` varchar(6) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expires_at` timestamp NOT NULL,
  `used` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_code` (`user_id`,`code`),
  KEY `idx_expires` (`expires_at`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `password_reset_codes`
--

INSERT INTO `password_reset_codes` (`id`, `user_id`, `code`, `expires_at`, `used`, `created_at`) VALUES
(1, 2, '369074', '2026-01-05 10:47:59', 0, '2026-01-05 10:32:58');

-- --------------------------------------------------------

--
-- Structure de la table `simulations`
--

DROP TABLE IF EXISTS `simulations`;
CREATE TABLE IF NOT EXISTS `simulations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `simulation_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `montant_demande` decimal(10,2) NOT NULL,
  `duree_mois` int NOT NULL,
  `taux_applique` decimal(5,2) NOT NULL,
  `mensualite` decimal(10,2) NOT NULL,
  `cout_total` decimal(10,2) NOT NULL,
  `frais_ouverture` decimal(10,2) DEFAULT '0.00',
  `responses` json NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB AUTO_INCREMENT=48 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `simulations`
--

INSERT INTO `simulations` (`id`, `user_id`, `simulation_type`, `montant_demande`, `duree_mois`, `taux_applique`, `mensualite`, `cout_total`, `frais_ouverture`, `responses`, `created_at`) VALUES
(12, 3, 'travaux', 56000.00, 24, 4.29, 0.00, 0.00, 0.00, '{\"main-1\": \"Je fais des travaux\", \"travaux-1\": \"Cuisine / Salle de bain\", \"travaux-2\": \"56000\", \"travaux-3\": \"Oui, devis signés\", \"travaux-4\": \"Oui\", \"travaux-5\": \"Oui, propriétaire\", \"travaux-6\": \"Dans 1 à 3 mois\", \"travaux-7\": \"19000\", \"travaux-8\": \"24 mois\", \"travaux-9\": \"Veuf / Veuve\", \"travaux-10\": \"5\", \"travaux-11\": \"Intérim\", \"travaux-12\": \"2500\", \"travaux-13\": \"Non\", \"travaux-14\": \"Non\"}', '2025-12-16 10:04:24'),
(13, 3, 'vehicule', 70000.00, 12, 3.41, 0.00, 0.00, 0.00, '{\"main-1\": \"J\'achète un véhicule\", \"vehicule-1\": \"Caravane / Mobil-Home\", \"vehicule-2\": \"Neuf\", \"vehicule-3\": \"70000\", \"vehicule-4\": \"30000\", \"vehicule-5\": \"12 mois\", \"vehicule-6\": \"Célibataire\", \"vehicule-7\": \"6\", \"vehicule-8\": \"Non, locataire\", \"vehicule-9\": \"Fonctionnaire\", \"vehicule-10\": \"Moins de 3 mois\", \"vehicule-11\": \"1000\", \"vehicule-12\": \"Non\", \"vehicule-14\": \"Non, jamais\", \"vehicule-15\": \"Non\", \"vehicule-16\": \"Non\", \"vehicule-8b\": \"1250\", \"vehicule-11b\": \"Non\"}', '2025-12-16 10:22:02'),
(14, 3, 'equipement', 20000.00, 12, 4.07, 1703.64, 20443.65, 0.00, '{\"main-1\": \"Je m\'équipe\", \"equipement-1\": \"Mobilier\", \"equipement-2\": \"20000\", \"equipement-3\": \"10000\", \"equipement-4\": \"12 mois\", \"equipement-5\": \"Célibataire\", \"equipement-6\": \"3\", \"equipement-7\": \"Profession libérale\", \"equipement-8\": \"2500\", \"equipement-9\": \"Non\"}', '2025-12-16 10:23:40'),
(39, 1, 'vehicule', 5000.00, 24, 3.93, 216.97, 5207.25, 0.00, '{\"main-1\": \"J\'achète un véhicule\", \"vehicule-1\": \"Auto\", \"vehicule-2\": \"Neuf\", \"vehicule-3\": \"5000\", \"vehicule-4\": \"3000\", \"vehicule-5\": \"24 mois\", \"vehicule-6\": \"Célibataire\", \"vehicule-7\": \"0\", \"vehicule-8\": \"Oui, sans crédit\", \"vehicule-9\": \"Fonctionnaire\", \"vehicule-10\": \"1 à 2 ans\", \"vehicule-11\": \"1500\", \"vehicule-12\": \"Non\", \"vehicule-14\": \"Non, jamais\", \"vehicule-15\": \"Oui, actuellement\", \"vehicule-16\": \"Oui\", \"vehicule-11b\": \"Non\"}', '2025-12-26 10:21:54'),
(40, 1, 'travaux', 50000.00, 24, 4.29, 2177.71, 52264.94, 0.00, '{\"main-1\": \"Je fais des travaux\", \"travaux-1\": \"Toiture\", \"travaux-2\": \"50000\", \"travaux-3\": \"Oui, sans crédit immobilier\", \"travaux-4\": \"Oui\", \"travaux-5\": \"Oui, devis en cours\", \"travaux-6\": \"24 mois\", \"travaux-7\": \"Célibataire\", \"travaux-8\": \"0\", \"travaux-9\": \"Intérim\", \"travaux-10\": \"2 à 5 ans\", \"travaux-11\": \"4200\", \"travaux-12\": \"Non\"}', '2025-12-29 09:44:57'),
(41, 10, 'argent', 50000.00, 24, 5.29, 2200.07, 52801.66, 0.00, '{\"main-1\": \"J\'ai besoin d\'argent\", \"argent-1\": \"50000\", \"argent-2\": \"Autre\", \"argent-3\": \"Oui, sans crédit immobilier\", \"argent-4\": \"24 mois\", \"argent-5\": \"Célibataire\", \"argent-6\": \"3\", \"argent-7\": \"Fonctionnaire\", \"argent-8\": \"1 à 2 ans\", \"argent-9\": \"1950\", \"argent-11\": \"Non\", \"argent-13\": \"Non, jamais\"}', '2025-12-29 11:26:24'),
(42, 11, 'vehicule', 4200.00, 12, 3.41, 356.50, 4277.98, 0.00, '{\"main-1\": \"J\'achète un véhicule\", \"vehicule-1\": \"Moto\", \"vehicule-2\": \"Neuf\", \"vehicule-3\": \"4200\", \"vehicule-4\": \"1250\", \"vehicule-5\": \"12 mois\", \"vehicule-6\": \"Célibataire\", \"vehicule-7\": \"0\", \"vehicule-8\": \"Oui, sans crédit\", \"vehicule-9\": \"Intérim\", \"vehicule-10\": \"3 à 6 mois\", \"vehicule-11\": \"1250\", \"vehicule-12\": \"Oui\", \"vehicule-13\": \"3000\", \"vehicule-14\": \"Non, jamais\", \"vehicule-15\": \"Non\", \"vehicule-16\": \"Non\", \"vehicule-10b\": \"Dans moins de 3 mois\", \"vehicule-11b\": \"Non\", \"vehicule-13b\": \"Crédit auto\"}', '2025-12-29 11:38:23'),
(43, 1, 'argent', 100000.00, 72, 7.86, 0.00, 0.00, 0.00, '{\"main-1\": \"J\'ai besoin d\'argent\", \"argent-1\": \"100000\", \"argent-2\": \"Financer un projet personnel\", \"argent-3\": \"Oui, sans crédit immobilier\", \"argent-4\": \"72 mois\", \"argent-5\": \"Marié(e) / Pacsé(e)\", \"argent-6\": \"3\", \"argent-7\": \"Fonctionnaire\", \"argent-8\": \"1 à 2 ans\", \"argent-9\": \"10000\", \"argent-11\": \"Non\", \"argent-13\": \"Non, jamais\", \"argent-5b\": \"Oui\", \"argent-5c\": \"1500\"}', '2026-01-02 15:15:59'),
(44, 12, 'argent', 60000.00, 60, 7.21, 0.00, 0.00, 0.00, '{\"main-1\": \"J\'ai besoin d\'argent\", \"argent-1\": \"60000\", \"argent-2\": \"Financer un projet personnel\", \"argent-3\": \"Non, locataire\", \"argent-4\": \"60 mois\", \"argent-5\": \"Marié(e) / Pacsé(e)\", \"argent-6\": \"2\", \"argent-7\": \"CDI\", \"argent-8\": \"2 à 5 ans\", \"argent-9\": \"3500\", \"argent-11\": \"Non\", \"argent-13\": \"Non, jamais\", \"argent-5b\": \"Oui\", \"argent-5c\": \"3500\"}', '2026-01-05 10:50:51'),
(45, 12, 'argent', 60000.00, 60, 7.21, 0.00, 0.00, 0.00, '{\"main-1\": \"J\'ai besoin d\'argent\", \"argent-1\": \"60000\", \"argent-2\": \"Financer un projet personnel\", \"argent-3\": \"Non, locataire\", \"argent-4\": \"60 mois\", \"argent-5\": \"Marié(e) / Pacsé(e)\", \"argent-6\": \"2\", \"argent-7\": \"CDI\", \"argent-8\": \"2 à 5 ans\", \"argent-9\": \"3500\", \"argent-11\": \"Non\", \"argent-13\": \"Non, jamais\", \"argent-5b\": \"Oui\", \"argent-5c\": \"3500\"}', '2026-01-05 10:53:36'),
(46, 2, 'argent', 200000.00, 84, 8.50, 3167.30, 266052.96, 20000.00, '{\"main-1\": \"J\'ai besoin d\'argent\", \"argent-1\": \"200000\", \"argent-2\": \"Financer un projet personnel\", \"argent-3\": \"Oui, avec crédit immobilier en cours\", \"argent-4\": \"84 mois\", \"argent-5\": \"Concubinage\", \"argent-6\": \"12\", \"argent-7\": \"Sans emploi\", \"argent-9\": \"800\", \"argent-11\": \"Oui\", \"argent-12\": \"5000\", \"argent-13\": \"Oui, actuellement\", \"argent-5b\": \"Non\"}', '2026-01-05 11:39:14'),
(47, 2, 'vehicule', 15000.00, 24, 3.93, 650.91, 15621.76, 750.00, '{\"main-1\": \"J\'achète un véhicule\", \"vehicule-1\": \"Moto\", \"vehicule-2\": \"Neuf\", \"vehicule-3\": \"15000\", \"vehicule-4\": \"3000\", \"vehicule-5\": \"24 mois\", \"vehicule-6\": \"Célibataire\", \"vehicule-7\": \"0\", \"vehicule-8\": \"Oui, sans crédit\", \"vehicule-9\": \"Fonctionnaire\", \"vehicule-10\": \"1 à 2 ans\", \"vehicule-11\": \"2100\", \"vehicule-12\": \"Non\", \"vehicule-14\": \"Non, jamais\", \"vehicule-15\": \"Non\", \"vehicule-16\": \"Non\", \"vehicule-11b\": \"Oui (location, prime, etc.)\", \"vehicule-11c\": \"1250\"}', '2026-01-05 11:53:08');

-- --------------------------------------------------------

--
-- Structure de la table `subscription_plans`
--

DROP TABLE IF EXISTS `subscription_plans`;
CREATE TABLE IF NOT EXISTS `subscription_plans` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `display_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `simulations_per_month` int DEFAULT NULL COMMENT 'NULL = illimité',
  `commission_rate` decimal(5,2) DEFAULT '0.00' COMMENT 'Taux de commission en %',
  `commission_threshold` decimal(10,2) DEFAULT '0.00' COMMENT 'Montant à partir duquel la commission s''applique',
  `max_loan_amount` decimal(10,2) DEFAULT NULL COMMENT 'Montant maximum empruntable',
  `description` text COLLATE utf8mb4_unicode_ci,
  `price` decimal(10,2) DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `subscription_plans`
--

INSERT INTO `subscription_plans` (`id`, `name`, `display_name`, `simulations_per_month`, `commission_rate`, `commission_threshold`, `max_loan_amount`, `description`, `price`, `created_at`) VALUES
(1, 'gratuit', 'Pack Gratuit', 3, 5.00, 75000.00, 75000.00, 'Idéal pour tester notre service. 3 simulations par mois incluses. Frais d\'ouverture de dossier : 5% pour les prêts jusqu\'à 75 000€.', 0.00, '2025-12-09 11:26:04'),
(2, 'illimite', 'Pack Illimité', NULL, 5.00, 75000.00, 200000.00, 'Pour les utilisateurs réguliers. Simulations illimitées, taux préférentiels, et possibilité d\'emprunter jusqu\'à 200 000€. Frais d\'ouverture de dossier : 5% jusqu\'à 75 000€, puis progressif de 5% à 10% au-delà.', 0.00, '2025-12-09 11:26:04');

-- --------------------------------------------------------

--
-- Structure de la table `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `subscription_plan` enum('gratuit','illimite') COLLATE utf8mb4_unicode_ci DEFAULT 'gratuit',
  `simulations_count` int DEFAULT '0',
  `last_reset_date` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `phone` (`phone`),
  KEY `idx_email` (`email`),
  KEY `idx_phone` (`phone`),
  KEY `idx_subscription` (`subscription_plan`)
) ;

--
-- Déchargement des données de la table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `phone`, `password`, `subscription_plan`, `simulations_count`, `last_reset_date`, `created_at`, `updated_at`) VALUES
(1, 'jean dupont', 'jean@gmail.com', NULL, '$2b$10$4jH.vlZrPs038UL2fVhpLeALXDgiDdlF2a4Os0XeOP9kCR0oCKu6i', 'illimite', 1, '2026-01-02', '2025-12-09 11:37:07', '2026-01-02 15:15:59'),
(2, 'avina', 'avina@gmail.com', NULL, '$2b$10$8/YkUNwRzrmnFwV/o0aHPOAK3kz.N4JbVVKcSMkofHx.b4MXXL9V2', 'illimite', 1, '2026-01-05', '2025-12-09 11:38:22', '2026-01-05 11:53:08'),
(3, 'paul', 'paul@gmail.com', NULL, '$2b$10$qxXYBm1nvAscBPZqOBL7J.Qa4SoMBRiXwiokC7eLkAeG.qkoJpUxS', 'gratuit', 3, '2025-12-09', '2025-12-09 11:56:07', '2025-12-16 10:23:40'),
(9, 'moomo', 'dsqdqsdq@gmail.com', NULL, '$2b$10$kLJma9lEvNGtzubd/d3NqeXh0dgDdCcXOTRmHQpReQro1RP6fMNda', 'illimite', 0, '2025-12-29', '2025-12-29 10:31:06', '2025-12-29 10:31:06'),
(10, 'Group Almanach', 'group.almanach@gmail.com', NULL, '$2b$10$MsBDILulxwAgEEIl6xuQfuE4gz0sfb2c/fDNnq6RC.uM1H4WTv8Ve', 'gratuit', 1, NULL, '2025-12-29 10:32:36', '2025-12-29 11:26:24'),
(11, 'jean nana', 'nana@gmail.com', NULL, '$2b$10$ACydzmlP2M6yP4sdg.8mHOJIvkpFB9dO7HV1WfAc7A0Qz8tN9HPkK', 'illimite', 1, '2025-12-29', '2025-12-29 11:37:39', '2025-12-29 11:38:23'),
(12, 'james scott', 'jeanbaptiste@netc.fr', NULL, '$2b$10$oQIP./fAsikPlfLoT96wjOfJwvqZXy8AjjkoJ8eoWUcqfYC7RM.9i', 'gratuit', 2, '2026-01-05', '2026-01-05 10:47:43', '2026-01-05 10:53:36'),
(13, 'jamesm', 'jedeanbaptiste@netc.fr', NULL, '$2b$10$F2C7ww5RtYWrx60KyYWZdOF2UHemMsWP2fFx1wQghKKIyL3ARZs5i', 'illimite', 0, '2026-01-05', '2026-01-05 11:13:18', '2026-01-05 11:13:18');

-- --------------------------------------------------------

--
-- Doublure de structure pour la vue `user_subscription_info`
-- (Voir ci-dessous la vue réelle)
--
DROP VIEW IF EXISTS `user_subscription_info`;
CREATE TABLE IF NOT EXISTS `user_subscription_info` (
`id` int
,`name` varchar(255)
,`email` varchar(255)
,`phone` varchar(20)
,`subscription_plan` enum('gratuit','illimite')
,`simulations_count` int
,`last_reset_date` date
,`plan_name` varchar(100)
,`simulations_per_month` int
,`commission_rate` decimal(5,2)
,`commission_threshold` decimal(10,2)
,`max_loan_amount` decimal(10,2)
,`plan_description` text
,`simulations_remaining` bigint
,`created_at` timestamp
);

-- --------------------------------------------------------

--
-- Structure de la vue `user_subscription_info`
--
DROP TABLE IF EXISTS `user_subscription_info`;

DROP VIEW IF EXISTS `user_subscription_info`;
CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `user_subscription_info`  AS SELECT `u`.`id` AS `id`, `u`.`name` AS `name`, `u`.`email` AS `email`, `u`.`phone` AS `phone`, `u`.`subscription_plan` AS `subscription_plan`, `u`.`simulations_count` AS `simulations_count`, `u`.`last_reset_date` AS `last_reset_date`, `sp`.`display_name` AS `plan_name`, `sp`.`simulations_per_month` AS `simulations_per_month`, `sp`.`commission_rate` AS `commission_rate`, `sp`.`commission_threshold` AS `commission_threshold`, `sp`.`max_loan_amount` AS `max_loan_amount`, `sp`.`description` AS `plan_description`, (case when (`sp`.`simulations_per_month` is null) then 999999 when (`u`.`last_reset_date` < date_format(now(),'%Y-%m-01')) then `sp`.`simulations_per_month` else (`sp`.`simulations_per_month` - `u`.`simulations_count`) end) AS `simulations_remaining`, `u`.`created_at` AS `created_at` FROM (`users` `u` left join `subscription_plans` `sp` on((`u`.`subscription_plan` = `sp`.`name`))) ;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `password_reset_codes`
--
ALTER TABLE `password_reset_codes`
  ADD CONSTRAINT `password_reset_codes_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `simulations`
--
ALTER TABLE `simulations`
  ADD CONSTRAINT `simulations_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
