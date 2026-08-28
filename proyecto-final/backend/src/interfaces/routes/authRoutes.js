/**
 * src/interfaces/routes/authRoutes.js
 * -----------------------------------------------------------------------
 * POST /auth/signup
 * POST /auth/login
 * -----------------------------------------------------------------------
 */
const { Router } = require('express');
const AuthController = require('../controllers/AuthController');
const { validateSignupPayload, validateLoginPayload } = require('../validators/authValidator');

const router = Router();

router.post('/signup', validateSignupPayload, AuthController.signup);
router.post('/login', validateLoginPayload, AuthController.login);

module.exports = router;
