SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

-- --------------------------------------------------------
-- Structure de la table `password_reset_codes`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `password_reset_codes`;
CREATE TABLE `password_reset_codes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `code` varchar(6) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expires_at` timestamp NOT NULL,
  `used` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_code` (`user_id`,`code`),
  KEY `idx_expires` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Structure de la table `subscription_plans`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `subscription_plans`;
CREATE TABLE `subscription_plans` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `display_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `simulations_per_month` int DEFAULT NULL,
  `commission_rate` decimal(5,2) DEFAULT '0.00',
  `commission_threshold` decimal(10,2) DEFAULT '0.00',
  `max_loan_amount` decimal(10,2) DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `price` decimal(10,2) DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `subscription_plans` (`id`, `name`, `display_name`, `simulations_per_month`, `commission_rate`, `commission_threshold`, `max_loan_amount`, `description`, `price`, `created_at`) VALUES
(1, 'gratuit', 'Pack Gratuit', 3, 5.00, 75000.00, 75000.00, 'Idéal pour tester notre service.  3 simulations par mois incluses.  Frais d\'ouverture de dossier : 5% pour les prêts jusqu\'à 75 000€.', 0.00, '2025-12-09 11:26:04'),
(2, 'illimite', 'Pack Illimité', NULL, 5.00, 75000.00, 200000.00, 'Pour les utilisateurs réguliers. Simulations illimitées, taux préférentiels, et possibilité d\'emprunter jusqu\'à 200 000€.  Frais d\'ouverture de dossier : 5% jusqu\'à 75 000€, puis progressif de 5% à 10% au-delà.', 0.00, '2025-12-09 11:26:04');

-- --------------------------------------------------------
-- Structure de la table `users`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `users` (`id`, `name`, `email`, `phone`, `password`, `subscription_plan`, `simulations_count`, `last_reset_date`, `created_at`, `updated_at`) VALUES
(1, 'jean dupont', 'jean@gmail.com', NULL, '$2b$10$4jH. vlZrPs038UL2fVhpLeALXDgiDdlF2a4Os0XeOP9kCR0oCKu6i', 'illimite', 1, '2026-01-02', '2025-12-09 11:37:07', '2026-01-02 15:15:59'),
(2, 'avina', 'avina@gmail.com', NULL, '$2b$10$8/YkUNwRzrmnFwV/o0aHPOAK3kz. N4JbVVKcSMkofHx. b4MXXL9V2', 'illimite', 1, '2026-01-05', '2025-12-09 11:38:22', '2026-01-05 11:53:08'),
(3, 'paul', 'paul@gmail.com', NULL, '$2b$10$qxXYBm1nvAscBPZqOBL7J. Qa4SoMBRiXwiokC7eLkAeG. qkoJpUxS', 'gratuit', 3, '2025-12-09', '2025-12-09 11:56:07', '2025-12-16 10:23:40'),
(9, 'moomo', 'dsqdqsdq@gmail.com', NULL, '$2b$10$kLJma9lEvNGtzubd/d3NqeXh0dgDdCcXOTRmHQpReQro1RP6fMNda', 'illimite', 0, '2025-12-29', '2025-12-29 10:31:06', '2025-12-29 10:31:06'),
(10, 'Group Almanach', 'group. almanach@gmail.com', NULL, '$2b$10$MsBDILulxwAgEEIl6xuQfuE4gz0sfb2c/fDNnq6RC. uM1H4WTv8Ve', 'gratuit', 1, NULL, '2025-12-29 10:32:36', '2025-12-29 11:26:24'),
(11, 'jean nana', 'nana@gmail.com', NULL, '$2b$10$ACydzmlP2M6yP4sdg. 8mHOJIvkpFB9dO7HV1WfAc7A0Qz8tN9HPkK', 'illimite', 1, '2025-12-29', '2025-12-29 11:37:39', '2025-12-29 11:38:23'),
(12, 'james scott', 'jeanbaptiste@netc.fr', NULL, '$2b$10$oQIP./fAsikPlfLoT96wjOfJwvqZXy8AjjkoJ8eoWUcqfYC7RM. 9i', 'gratuit', 2, '2026-01-05', '2026-01-05 10:47:43', '2026-01-05 10:53:36'),
(13, 'jamesm', 'jedeanbaptiste@netc.fr', NULL, '$2b$10$F2C7ww5RtYWrx60KyYWZdOF2UHemMsWP2fFx1wQghKKIyL3ARZs5i', 'illimite', 0, '2026-01-05', '2026-01-05 11:13:18', '2026-01-05 11:13:18');

-- --------------------------------------------------------
-- Structure de la table `simulations`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `simulations`;
CREATE TABLE `simulations` (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Structure de la vue `user_subscription_info`
-- --------------------------------------------------------

DROP VIEW IF EXISTS `user_subscription_info`;
CREATE VIEW `user_subscription_info` AS 
SELECT 
  `u`.`id` AS `id`, 
  `u`.`name` AS `name`, 
  `u`.`email` AS `email`, 
  `u`.`phone` AS `phone`, 
  `u`.`subscription_plan` AS `subscription_plan`, 
  `u`.`simulations_count` AS `simulations_count`, 
  `u`.`last_reset_date` AS `last_reset_date`, 
  `sp`.`display_name` AS `plan_name`, 
  `sp`.`simulations_per_month` AS `simulations_per_month`, 
  `sp`.`commission_rate` AS `commission_rate`, 
  `sp`.`commission_threshold` AS `commission_threshold`, 
  `sp`.`max_loan_amount` AS `max_loan_amount`, 
  `sp`.`description` AS `plan_description`, 
  (CASE 
    WHEN (`sp`.`simulations_per_month` IS NULL) THEN 999999 
    WHEN (`u`.`last_reset_date` < DATE_FORMAT(NOW(),'%Y-%m-01')) THEN `sp`.`simulations_per_month` 
    ELSE (`sp`.`simulations_per_month` - `u`.`simulations_count`) 
  END) AS `simulations_remaining`, 
  `u`.`created_at` AS `created_at` 
FROM (`users` `u` 
LEFT JOIN `subscription_plans` `sp` ON ((`u`.`subscription_plan` = `sp`.`name`)));

-- --------------------------------------------------------
-- Contraintes pour les tables déchargées
-- --------------------------------------------------------

ALTER TABLE `password_reset_codes`
  ADD CONSTRAINT `password_reset_codes_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

ALTER TABLE `simulations`
  ADD CONSTRAINT `simulations_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

COMMIT;