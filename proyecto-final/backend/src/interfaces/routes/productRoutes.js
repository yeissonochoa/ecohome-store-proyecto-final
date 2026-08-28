/**
 * src/interfaces/routes/productRoutes.js
 * -----------------------------------------------------------------------
 * GET    /products      -> público (consulta de catálogo, sin login)
 * GET    /products/:id  -> público
 * POST   /products       -> protegida: authJWT + authorizeRole('admin')
 * PUT    /products/:id   -> protegida: authJWT + authorizeRole('admin')
 * PATCH  /products/:id   -> protegida: authJWT + authorizeRole('admin')
 * DELETE /products/:id   -> protegida: authJWT + authorizeRole('admin')
 *
 * Decisión de diseño: el enunciado dice "Público o Autenticado según
 * req". Se optó por dejar la LECTURA (GET) pública, ya que el catálogo
 * de un e-commerce debe poder navegarse sin iniciar sesión (igual que
 * el requerimiento de negocio "Cliente: por ahora solo consulta").
 * La ESCRITURA (POST/PUT/PATCH/DELETE) siempre requiere token + rol
 * 'admin', que es exactamente la falla de seguridad reportada por el
 * CTO en el caso práctico.
 * -----------------------------------------------------------------------
 */
const { Router } = require('express');
const ProductController = require('../controllers/ProductController');
const authJWT = require('../../infrastructure/middlewares/authJWT');
const authorizeRole = require('../../infrastructure/middlewares/authorizeRole');
const { ROLES } = require('../../domain/entities/User');
const { validateCreateProduct, validateUpdateProduct } = require('../validators/productValidator');

const router = Router();

router.get('/', ProductController.getAll);
router.get('/:id', ProductController.getById);

router.post('/', authJWT, authorizeRole(ROLES.ADMIN), validateCreateProduct, ProductController.create);
router.put('/:id', authJWT, authorizeRole(ROLES.ADMIN), validateUpdateProduct, ProductController.update);
router.patch('/:id', authJWT, authorizeRole(ROLES.ADMIN), validateUpdateProduct, ProductController.update);
router.delete('/:id', authJWT, authorizeRole(ROLES.ADMIN), ProductController.remove);

module.exports = router;
