/**
 * src/use-cases/auth/LoginUseCase.js
 * -----------------------------------------------------------------------
 * Orquesta el login:
 *   1. Busca el usuario por email.
 *   2. Compara el password recibido contra el hash almacenado.
 *   3. Si es válido, firma un JWT con el payload mínimo (id, email, role).
 * Por seguridad, el mensaje de error es el mismo ante "usuario no
 * existe" y "password incorrecto", para no filtrar qué emails están
 * registrados (mitiga enumeración de usuarios).
 * -----------------------------------------------------------------------
 */
const AppError = require('../../infrastructure/utils/AppError');

class LoginUseCase {
  /**
   * @param {IUserRepository} userRepository
   * @param {typeof import('../../infrastructure/security/PasswordHasher')} passwordHasher
   * @param {typeof import('../../infrastructure/security/TokenService')} tokenService
   */
  constructor(userRepository, passwordHasher, tokenService) {
    this.userRepository = userRepository;
    this.passwordHasher = passwordHasher;
    this.tokenService = tokenService;
  }

  /**
   * @param {{email: string, password: string}} input
   * @returns {Promise<{token: string, user: object}>}
   */
  async execute({ email, password }) {
    if (!email || !password) {
      throw AppError.badRequest('Email y password son obligatorios.');
    }

    const user = await this.userRepository.findByEmail(email.toLowerCase().trim());
    const INVALID_CREDENTIALS_MSG = 'Credenciales inválidas.';

    if (!user) {
      throw AppError.unauthorized(INVALID_CREDENTIALS_MSG);
    }

    const passwordMatches = await this.passwordHasher.compare(password, user.passwordHash);
    if (!passwordMatches) {
      throw AppError.unauthorized(INVALID_CREDENTIALS_MSG);
    }

    const token = this.tokenService.sign({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    return { token, user: user.toPublicJSON() };
  }
}

module.exports = LoginUseCase;
