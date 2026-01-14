-- Base de données pour SimulateurCrédit
-- À exécuter dans phpMyAdmin (WampServer)

CREATE DATABASE IF NOT EXISTS simulateur_credit CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE simulateur_credit;

-- Table des utilisateurs
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE DEFAULT NULL,
    phone VARCHAR(20) UNIQUE DEFAULT NULL,
    password VARCHAR(255) NOT NULL,
    subscription_plan ENUM('gratuit', 'illimite') DEFAULT 'gratuit',
    simulations_count INT DEFAULT 0,
    last_reset_date DATE DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT check_contact CHECK (email IS NOT NULL OR phone IS NOT NULL)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table des simulations
CREATE TABLE IF NOT EXISTS simulations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    simulation_type VARCHAR(50) NOT NULL,
    montant_demande DECIMAL(10, 2) NOT NULL,
    duree_mois INT NOT NULL,
    taux_applique DECIMAL(5, 2) NOT NULL,
    mensualite DECIMAL(10, 2) NOT NULL,
    cout_total DECIMAL(10, 2) NOT NULL,
    commission DECIMAL(10, 2) DEFAULT 0,
    responses JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table des plans d'abonnement (informations statiques)
CREATE TABLE IF NOT EXISTS subscription_plans (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    simulations_per_month INT DEFAULT NULL COMMENT 'NULL = illimité',
    commission_rate DECIMAL(5, 2) DEFAULT 0 COMMENT 'Taux de commission en %',
    commission_threshold DECIMAL(10, 2) DEFAULT 0 COMMENT 'Montant à partir duquel la commission s''applique',
    max_loan_amount DECIMAL(10, 2) DEFAULT NULL COMMENT 'Montant maximum empruntable',
    description TEXT,
    price DECIMAL(10, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertion des plans d'abonnement
INSERT INTO subscription_plans (name, display_name, simulations_per_month, commission_rate, commission_threshold, max_loan_amount, description, price) VALUES
('gratuit', 'Pack Gratuit', 3, 5.00, 75000, 75000, 'Idéal pour tester notre service. 3 simulations par mois incluses. Frais d''ouverture de dossier : 5% pour les prêts jusqu''à 75 000€.', 0),
('illimite', 'Pack Illimité', NULL, 5.00, 75000, 200000, 'Pour les utilisateurs réguliers. Simulations illimitées, taux préférentiels, et possibilité d''emprunter jusqu''à 200 000€. Frais d''ouverture de dossier : 5% jusqu''à 75 000€, puis dégressif de 5% à 10% au-delà.', 0);

-- Table des codes de réinitialisation de mot de passe
CREATE TABLE IF NOT EXISTS password_reset_codes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    code VARCHAR(6) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_code (user_id, code),
    INDEX idx_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Index pour optimiser les recherches
CREATE INDEX idx_email ON users(email);
CREATE INDEX idx_phone ON users(phone);
CREATE INDEX idx_subscription ON users(subscription_plan);

-- Vue pour faciliter les requêtes avec informations complètes
CREATE VIEW user_subscription_info AS
SELECT 
    u.id,
    u.name,
    u.email,
    u.phone,
    u.subscription_plan,
    u.simulations_count,
    u.last_reset_date,
    sp.display_name as plan_name,
    sp.simulations_per_month,
    sp.commission_rate,
    sp.commission_threshold,
    sp.max_loan_amount,
    sp.description as plan_description,
    CASE 
        WHEN sp.simulations_per_month IS NULL THEN 999999
        WHEN u.last_reset_date < DATE_FORMAT(NOW(), '%Y-%m-01') THEN sp.simulations_per_month
        ELSE sp.simulations_per_month - u.simulations_count
    END as simulations_remaining,
    u.created_at
FROM users u
LEFT JOIN subscription_plans sp ON u.subscription_plan = sp.name;
