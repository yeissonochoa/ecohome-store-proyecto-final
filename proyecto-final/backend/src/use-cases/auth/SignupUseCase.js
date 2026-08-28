/**
 * src/use-cases/auth/SignupUseCase.js
 * -----------------------------------------------------------------------
 * Orquesta el registro de un usuario nuevo:
 *   1. Verifica que el email no exista.
 *   2. Hashea el password (nunca se persiste en texto plano).
 *   3. Persiste el usuario a través del repositorio (inyectado).
 * No conoce Express ni PostgreSQL directamente: recibe sus
 * dependencias por constructor (Inversión de Dependencias).
 * -----------------------------------------------------------------------
 */
const { User, ROLES } = require('../../domain/entities/User');
const AppError = require('../../infrastructure/utils/AppError');

class SignupUseCase {
  /**
   * @param {IUserRepository} userRepository
   * @param {typeof import('../../infrastructure/security/PasswordHasher')} passwordHasher
   */
  constructor(userRepository, passwordHasher) {
    this.userRepository = userRepository;
    this.passwordHasher = passwordHasher;
  }

  /**
   * @param {{name: string, email: string, password: string, role?: string}} input
   * @returns {Promise<User>}
   */
  async execute({ name, email, password, role }) {
    if (!name || !name.trim()) {
      throw AppError.badRequest('El nombre es obligatorio.');
    }
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      throw AppError.badRequest('El email no es válido.');
    }
    if (!password || password.length < 6) {
      throw AppError.badRequest('La contraseña debe tener al menos 6 caracteres.');
    }

    const safeRole = role === ROLES.ADMIN ? ROLES.ADMIN : ROLES.CLIENT;

    const existing = await this.userRepository.findByEmail(email.toLowerCase().trim());
    if (existing) {
      throw AppError.conflict('Ya existe un usuario registrado con ese email.');
    }

    const passwordHash = await this.passwordHasher.hash(password);

    const newUser = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      role: safeRole,
    });

    return this.userRepository.create(newUser);
  }
}

module.exports = SignupUseCase;
