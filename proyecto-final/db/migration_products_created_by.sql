-- =========================================================
-- EcoHome Store - Migración Unidad 3: Trazabilidad de productos
-- =========================================================
-- Ejecutar después de schema.sql y migration_messages.sql
-- Uso: node scripts/run-sql.js database/migration_products_created_by.sql
-- =========================================================

-- Se permite NULL para no romper productos creados antes de esta migración
-- (no hay forma de reconstruir retroactivamente quién los creó). Todo
-- producto NUEVO, a partir de esta unidad, sí quedará siempre asociado
-- a un usuario a través de la capa de aplicación (CreateProductUseCase).
ALTER TABLE products
    ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_products_created_by ON products (created_by);
