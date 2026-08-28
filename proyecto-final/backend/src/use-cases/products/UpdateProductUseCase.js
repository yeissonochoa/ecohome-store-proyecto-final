/**
 * src/use-cases/products/UpdateProductUseCase.js
 * -----------------------------------------------------------------------
 * PUT/PATCH /products/:id (protegida: admin) -> actualiza un producto.
 * Soporta actualización parcial (PATCH) y total (PUT); valida que, si
 * se envían name/price, cumplan las reglas de negocio antes de tocar
 * la base de datos.
 * -----------------------------------------------------------------------
 */
const { Product } = require('../../domain/entities/Product');
const AppError = require('../../infrastructure/utils/AppError');

class UpdateProductUseCase {
  /** @param {IProductRepository} productRepository */
  constructor(productRepository) {
    this.productRepository = productRepository;
  }

  /**
   * @param {string} id
   * @param {{name?: string, price?: number, isActive?: boolean, stock?: number}} changes
   */
  async execute(id, changes) {
    const existing = await this.productRepository.findById(id);
    if (!existing) {
      throw AppError.notFound(`Producto con id '${id}' no encontrado.`);
    }

    Product.validate({
      name: changes.name !== undefined ? changes.name : existing.name,
      price: changes.price !== undefined ? changes.price : existing.price,
    });

    const updated = await this.productRepository.update(id, changes);
    return updated.toPublicJSON();
  }
}

module.exports = UpdateProductUseCase;
