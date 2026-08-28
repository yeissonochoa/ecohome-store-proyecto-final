/**
 * src/use-cases/products/GetProductByIdUseCase.js
 * -----------------------------------------------------------------------
 * GET /products/:id -> retorna un producto por id (404 si no existe).
 * -----------------------------------------------------------------------
 */
const AppError = require('../../infrastructure/utils/AppError');

class GetProductByIdUseCase {
  /** @param {IProductRepository} productRepository */
  constructor(productRepository) {
    this.productRepository = productRepository;
  }

  /** @param {string} id */
  async execute(id) {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw AppError.notFound(`Producto con id '${id}' no encontrado.`);
    }
    return product.toPublicJSON();
  }
}

module.exports = GetProductByIdUseCase;
