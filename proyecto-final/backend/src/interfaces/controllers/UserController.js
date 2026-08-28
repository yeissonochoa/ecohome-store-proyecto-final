/**
 * src/interfaces/controllers/UserController.js
 * -----------------------------------------------------------------------
 * Endpoints sobre el propio usuario autenticado. GET /users/me/stats es
 * el entregable de la Actividad 3: expone el contador "Nombre (N)" para
 * que React y Flutter lo consuman de forma idéntica (mismo contrato,
 * mismo JWT), sin recalcularlo en el cliente.
 * -----------------------------------------------------------------------
 */
const PostgresUserRepository = require('../../infrastructure/repositories/PostgresUserRepository');
const PostgresProductRepository = require('../../infrastructure/repositories/PostgresProductRepository');
const GetUserStatsUseCase = require('../../use-cases/users/GetUserStatsUseCase');

const userRepository = new PostgresUserRepository();
const productRepository = new PostgresProductRepository();
const getUserStatsUseCase = new GetUserStatsUseCase(userRepository, productRepository);

class UserController {
  static async getMyStats(req, res, next) {
    try {
      const stats = await getUserStatsUseCase.execute(req.user.id);
      return res.status(200).json({ success: true, data: stats });
    } catch (err) {
      return next(err);
    }
  }
}

module.exports = UserController;
