/**
 * src/domain/entities/Product.js
 * -----------------------------------------------------------------------
 * Entidad de dominio "Producto". Centraliza la regla de negocio de que
 * el precio debe ser estrictamente mayor a 0 y el nombre no puede
 * estar vacío, para que ningún caso de uso pueda saltarse la validación.
 * -----------------------------------------------------------------------
 */

class ProductValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ProductValidationError';
    this.statusCode = 400;
  }
}

class Product {
  /**
   * @param {Object} props
   * @param {string} [props.id]
   * @param {string} props.name
   * @param {number} props.price
   * @param {boolean} [props.isActive]
   * @param {number} [props.stock]
   * @param {string} [props.createdBy] ID del usuario que creó el producto (trazabilidad, Unidad 3)
   * @param {string} [props.creatorUsername] Username/email del creador, para no forzar un JOIN en el cliente
   * @param {Date|string} [props.createdAt]
   * @param {Date|string} [props.updatedAt]
   */
  constructor({ id, name, price, isActive = true, stock = 0, createdBy = null, creatorUsername = null, createdAt, updatedAt }) {
    Product.validate({ name, price });

    this.id = id;
    this.name = name.trim();
    this.price = Number(price);
    this.isActive = isActive;
    this.stock = stock;
    this.createdBy = createdBy;
    this.creatorUsername = creatorUsername;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static validate({ name, price }) {
    if (typeof name !== 'string' || name.trim().length === 0) {
      throw new ProductValidationError('El nombre del producto es obligatorio.');
    }
    const numericPrice = Number(price);
    if (Number.isNaN(numericPrice) || numericPrice <= 0) {
      throw new ProductValidationError('El precio debe ser un número mayor a 0.');
    }
  }

  toPublicJSON() {
    return {
      id: this.id,
      name: this.name,
      price: this.price,
      isActive: this.isActive,
      stock: this.stock,
      createdBy: this.createdBy,
      creatorUsername: this.creatorUsername,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

module.exports = { Product, ProductValidationError };
