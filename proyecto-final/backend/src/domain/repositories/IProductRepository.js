/**
 * src/domain/repositories/IProductRepository.js
 * -----------------------------------------------------------------------
 * Puerto del patrón Repository para la entidad Producto.
 * -----------------------------------------------------------------------
 */
class IProductRepository {
  /* eslint-disable no-unused-vars, class-methods-use-this */

  /** @returns {Promise<Product[]>} */
  async findAll() {
    throw new Error('IProductRepository.findAll no implementado');
  }

  /** @param {string} id @returns {Promise<Product|null>} */
  async findById(id) {
    throw new Error('IProductRepository.findById no implementado');
  }

  /** @param {Product} product @returns {Promise<Product>} */
  async create(product) {
    throw new Error('IProductRepository.create no implementado');
  }

  /**
   * @param {string} id
   * @param {Partial<{name: string, price: number, isActive: boolean, stock: number}>} changes
   * @returns {Promise<Product|null>}
   */
  async update(id, changes) {
    throw new Error('IProductRepository.update no implementado');
  }

  /** @param {string} id @returns {Promise<boolean>} */
  async delete(id) {
    throw new Error('IProductRepository.delete no implementado');
  }

  /**
   * Cuenta productos creados por un usuario (Unidad 3, Actividad 3).
   * @param {string} userId
   * @returns {Promise<number>}
   */
  async countByCreator(userId) {
    throw new Error('IProductRepository.countByCreator no implementado');
  }
}

module.exports = IProductRepository;
