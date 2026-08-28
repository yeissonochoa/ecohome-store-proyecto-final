/**
 * src/interfaces/routes/userRoutes.js
 * -----------------------------------------------------------------------
 * GET /users/me/stats -> protegida (cualquier usuario autenticado).
 * -----------------------------------------------------------------------
 */
const { Router } = require('express');
const UserController = require('../controllers/UserController');
const authJWT = require('../../infrastructure/middlewares/authJWT');

const router = Router();

router.get('/me/stats', authJWT, UserController.getMyStats);

module.exports = router;
