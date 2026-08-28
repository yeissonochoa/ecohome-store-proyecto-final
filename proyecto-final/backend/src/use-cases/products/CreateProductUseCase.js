/**
 * src/use-cases/products/CreateProductUseCase.js
 * -----------------------------------------------------------------------
 * POST /products (protegida: admin) -> crea un producto.
 * A partir de la Unidad 3, exige el id del usuario autenticado (tomado
 * del JWT por el controller) y lo asocia como createdBy, cumpliendo el
 * requisito de trazabilidad: "cada producto queda ligado al usuario
 * autenticado".
 * -----------------------------------------------------------------------
 */
const { Product } = require('../../domain/entities/Product');
const AppError = require('../../infrastructure/utils/AppError');

class CreateProductUseCase {
  /** @param {IProductRepository} productRepository */
  constructor(productRepository) {
    this.productRepository = productRepository;
  }

  /** @param {{name: string, price: number, stock?: number, createdBy: string}} input */
  async execute({ name, price, stock = 0, createdBy }) {
    if (!createdBy) {
      // Salvaguarda de dominio: nunca debe poder crearse un producto sin
      // trazabilidad, incluso si algún día se agrega otra vía de entrada
      // además del controller HTTP actual.
      throw AppError.unauthorized('No se pudo determinar el usuario creador del producto.');
    }
    const product = new Product({ name, price, stock, isActive: true, createdBy });
    return (await this.productRepository.create(product)).toPublicJSON();
  }
}

module.exports = CreateProductUseCase;
