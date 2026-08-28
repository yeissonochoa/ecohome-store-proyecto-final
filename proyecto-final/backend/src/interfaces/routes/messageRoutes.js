/**
 * src/interfaces/routes/messageRoutes.js
 * -----------------------------------------------------------------------
 * GET /messages/recent  -> protegida (cualquier usuario autenticado).
 * Es el "endpoint de verificación" que exige la Actividad 2 del caso
 * práctico para demostrar la persistencia de mensajes sin depender
 * solo del chat en vivo.
 * -----------------------------------------------------------------------
 */
const { Router } = require('express');
const MessageController = require('../controllers/MessageController');
const authJWT = require('../../infrastructure/middlewares/authJWT');

const router = Router();

router.get('/recent', authJWT, MessageController.getRecent);

module.exports = router;
