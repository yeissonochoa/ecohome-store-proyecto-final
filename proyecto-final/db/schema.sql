-- =========================================================
-- EcoHome Store - Script de inicialización de base de datos
-- =========================================================
-- Motor: PostgreSQL 13+
-- Ejecutar como: psql -U <usuario> -d <basededatos> -f schema.sql
-- =========================================================

-- Extensión requerida para generar UUID (gen_random_uuid)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---------------------------------------------------------
-- Tipo ENUM para el rol del usuario (RBAC)
-- ---------------------------------------------------------
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('admin', 'client');
    END IF;
END$$;

-- ---------------------------------------------------------
-- Tabla: users
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name          VARCHAR(120)  NOT NULL,
    email         VARCHAR(150)  NOT NULL UNIQUE,
    password_hash TEXT          NOT NULL,
    role          user_role     NOT NULL DEFAULT 'client',
    created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);

-- ---------------------------------------------------------
-- Tabla: products
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(150)   NOT NULL,
    price       DECIMAL(10, 2) NOT NULL CHECK (price > 0),
    is_active   BOOLEAN        NOT NULL DEFAULT TRUE, -- soporta "marcar agotado" / soft delete
    stock       INTEGER        NOT NULL DEFAULT 0 CHECK (stock >= 0),
    created_at  TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_name ON products (name);

-- ---------------------------------------------------------
-- Trigger para mantener products.updated_at actualizado
-- ---------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_products_updated_at ON products;
CREATE TRIGGER trg_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------
-- Datos semilla opcionales (un admin y algunos productos)
-- La contraseña "Admin123!" ya viene hasheada con bcrypt (10 rounds)
-- Solo referencial: se recomienda crear el admin real vía /auth/signup
-- ---------------------------------------------------------
-- INSERT INTO users (name, email, password_hash, role)
-- VALUES ('Admin EcoHome', 'admin@ecohome.test',
--         '$2b$10$8K1p/a0dURXAv2EKQMXqIeS.Qb9Y9Zz6qDcXk9G8m9ZQ2p9m3m1S6', 'admin');
