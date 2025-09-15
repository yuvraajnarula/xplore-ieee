-- Initialize MySQL schemas and permissions for Quantum Identity System
-- Runs automatically via docker-compose bind mount

CREATE DATABASE IF NOT EXISTS `quantum_identity` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS 'quantum_user'@'%' IDENTIFIED BY 'quantum_pass';
GRANT ALL PRIVILEGES ON `quantum_identity`.* TO 'quantum_user'@'%';
FLUSH PRIVILEGES;

-- Optionally create logical schemas (namespaces)
-- MySQL uses databases; we can keep a single database and logical prefixes.
-- Table creation is handled by app migrations or on-startup code.

