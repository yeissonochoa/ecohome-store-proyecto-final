/**
 * src/use-cases/products/DeleteProductUseCase.js
 * -----------------------------------------------------------------------
 * DELETE /products/:id (protegida: admin) -> elimina un producto.
 * -----------------------------------------------------------------------
 */
const AppError = require('../../infrastructure/utils/AppError');

class DeleteProductUseCase {
  /** @param {IProductRepository} productRepository */
  constructor(productRepository) {
    this.productRepository = productRepository;
  }

  /** @param {string} id */
  async execute(id) {
    const deleted = await this.productRepository.delete(id);
    if (!deleted) {
      throw AppError.notFound(`Producto con id '${id}' no encontrado.`);
    }
    return { id, deleted: true };
  }
}

module.exports = DeleteProductUseCase;
