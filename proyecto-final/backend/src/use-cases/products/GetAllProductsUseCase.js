/**
 * src/use-cases/products/GetAllProductsUseCase.js
 * -----------------------------------------------------------------------
 * GET /products -> retorna todos los productos.
 * -----------------------------------------------------------------------
 */
class GetAllProductsUseCase {
  /** @param {IProductRepository} productRepository */
  constructor(productRepository) {
    this.productRepository = productRepository;
  }

  async execute() {
    const products = await this.productRepository.findAll();
    return products.map((p) => p.toPublicJSON());
  }
}

module.exports = GetAllProductsUseCase;
