-- Initialize the quantum identity database
CREATE DATABASE IF NOT EXISTS quantum_identity;

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create schemas for different services
CREATE SCHEMA IF NOT EXISTS trust_calc;
CREATE SCHEMA IF NOT EXISTS temporal_scheduler;
CREATE SCHEMA IF NOT EXISTS context_analyzer;
CREATE SCHEMA IF NOT EXISTS quantum_cache;

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE quantum_identity TO quantum_user;
GRANT ALL PRIVILEGES ON SCHEMA trust_calc TO quantum_user;
GRANT ALL PRIVILEGES ON SCHEMA temporal_scheduler TO quantum_user;
GRANT ALL PRIVILEGES ON SCHEMA context_analyzer TO quantum_user;
GRANT ALL PRIVILEGES ON SCHEMA quantum_cache TO quantum_user;
