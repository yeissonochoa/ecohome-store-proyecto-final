/**
 * src/interfaces/controllers/AuthController.js
 * -----------------------------------------------------------------------
 * Adaptador HTTP: traduce req/res de Express hacia/desde los casos de
 * uso de autenticación. No contiene lógica de negocio: solo orquesta
 * la llamada y formatea la respuesta.
 *
 * Composition root manual: aquí se "cablean" las dependencias
 * concretas (repositorio PostgreSQL, bcrypt, jwt) dentro de los casos
 * de uso, que solo conocen las interfaces/abstracciones.
 * -----------------------------------------------------------------------
 */
const PostgresUserRepository = require('../../infrastructure/repositories/PostgresUserRepository');
const PasswordHasher = require('../../infrastructure/security/PasswordHasher');
const TokenService = require('../../infrastructure/security/TokenService');
const SignupUseCase = require('../../use-cases/auth/SignupUseCase');
const LoginUseCase = require('../../use-cases/auth/LoginUseCase');

const userRepository = new PostgresUserRepository();
const signupUseCase = new SignupUseCase(userRepository, PasswordHasher);
const loginUseCase = new LoginUseCase(userRepository, PasswordHasher, TokenService);

class AuthController {
  static async signup(req, res, next) {
    try {
      const { name, email, password, role } = req.body;
      const user = await signupUseCase.execute({ name, email, password, role });
      return res.status(201).json({ success: true, data: user.toPublicJSON() });
    } catch (err) {
      return next(err);
    }
  }

  static async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const { token, user } = await loginUseCase.execute({ email, password });
      return res.status(200).json({ success: true, data: { token, user } });
    } catch (err) {
      return next(err);
    }
  }
}

module.exports = AuthController;
