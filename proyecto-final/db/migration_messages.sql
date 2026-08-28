-- =========================================================
-- EcoHome Store - Migración Unidad 2: Chat interno en tiempo real
-- =========================================================
-- Ejecutar después de database/schema.sql
-- Uso: psql -U <usuario> -d <basededatos> -f database/migration_messages.sql
-- =========================================================

CREATE TABLE IF NOT EXISTS messages (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    username   VARCHAR(120) NOT NULL, -- desnormalizado a propósito: evita un JOIN
                                       -- en cada carga de historial y preserva el
                                       -- nombre visible aunque el usuario cambie su
                                       -- nombre más adelante.
    text       TEXT NOT NULL CHECK (char_length(trim(text)) > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índice para acelerar "traer los últimos N mensajes" (ORDER BY created_at DESC LIMIT N)
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_user_id ON messages (user_id);
