/**
 * src/use-cases/users/GetUserStatsUseCase.js
 * -----------------------------------------------------------------------
 * Entrega la métrica exigida por la Actividad 3: cuántos productos ha
 * creado el usuario autenticado, en formato listo para renderizar como
 * "Nombre (N)" tanto en React como en Flutter, sin que cada cliente
 * tenga que calcular el conteo por su cuenta.
 * -----------------------------------------------------------------------
 */
class GetUserStatsUseCase {
  /**
   * @param {IUserRepository} userRepository
   * @param {IProductRepository} productRepository
   */
  constructor(userRepository, productRepository) {
    this.userRepository = userRepository;
    this.productRepository = productRepository;
  }

  /** @param {string} userId */
  async execute(userId) {
    const user = await this.userRepository.findById(userId);
    const productsCreated = await this.productRepository.countByCreator(userId);

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      productsCreated,
      // Formato exacto pedido por el enunciado: "Arturo (14)"
      label: `${user.name} (${productsCreated})`,
    };
  }
}

module.exports = GetUserStatsUseCase;
